﻿using System;
using System.IO;
using HomeGenie.Service.Constants;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using MIG.Config;
using System.Xml.Serialization;
using System.Collections.Generic;
using HomeGenie.Automation;

namespace HomeGenie.Service
{
    public class PackageManager
    {
        private HomeGenieService homegenie;
        private string widgetBasePath;

        public PackageManager(HomeGenieService hg)
        {
            homegenie = hg;
            widgetBasePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "html", "pages", "control", "widgets");
        }

        public bool InstallPackage(string pkgFolderUrl, string tempFolderPath)
        {
            string installFolder = Path.Combine(tempFolderPath, "pkg");
            dynamic pkgData = null;
            bool success = true;
            // Download package specs
            homegenie.RaiseEvent(
                Domains.HomeGenie_System,
                Domains.HomeGenie_PackageInstaller,
                SourceModule.Master,
                "HomeGenie Package Installer",
                Properties.InstallProgressMessage,
                "= Downloading: package.json"
            );
            using (var client = new WebClient())
            {
                try
                {
                    string pkgJson = "[" + client.DownloadString(pkgFolderUrl + "/package.json") + "]";
                    pkgData = (JsonConvert.DeserializeObject(pkgJson) as JArray)[0];
                }
                catch
                {
                    success = false;
                }
                client.Dispose();
            }
            // Download and install package files
            if (success && pkgData != null)
            {
                // Import Automation Programs in package
                foreach (var program in pkgData.programs)
                {
                    homegenie.RaiseEvent(
                        Domains.HomeGenie_System,
                        Domains.HomeGenie_PackageInstaller,
                        SourceModule.Master,
                        "HomeGenie Package Installer",
                        Properties.InstallProgressMessage,
                        "= Downloading: " + program.file.ToString()
                    );
                    Utility.FolderCleanUp(installFolder);
                    string programFile = Path.Combine(installFolder, program.file.ToString());
                    if (File.Exists(programFile))
                        File.Delete(programFile);
                    using (var client = new WebClient())
                    {
                        try
                        {
                            client.DownloadFile(pkgFolderUrl + "/" + program.file.ToString(), programFile);
                        }
                        catch
                        {
                            success = false;
                        }
                        client.Dispose();
                    }
                    if (success)
                    {
                        homegenie.RaiseEvent(
                            Domains.HomeGenie_System,
                            Domains.HomeGenie_PackageInstaller,
                            SourceModule.Master,
                            "HomeGenie Package Installer",
                            Properties.InstallProgressMessage,
                            "= Installing: " + program.name.ToString()
                        );
                        int pid = int.Parse(program.uid.ToString());
                        var oldProgram = homegenie.ProgramManager.ProgramGet(pid);
                        if (oldProgram != null)
                        {
                            homegenie.RaiseEvent(
                                Domains.HomeGenie_System,
                                Domains.HomeGenie_PackageInstaller,
                                SourceModule.Master,
                                "HomeGenie Package Installer",
                                Properties.InstallProgressMessage,
                                "= Replacing: '" + oldProgram.Name + "' with pid " + pid
                            );
                            homegenie.ProgramManager.ProgramRemove(oldProgram);
                        }
                        var programBlock = ProgramImport(pid, programFile, program.group.ToString());
                        if (programBlock != null)
                        {
                            programBlock.IsEnabled = true;
                            homegenie.RaiseEvent(
                                Domains.HomeGenie_System,
                                Domains.HomeGenie_PackageInstaller,
                                SourceModule.Master,
                                "HomeGenie Package Installer",
                                Properties.InstallProgressMessage,
                                "= Installed: '" + program.name.ToString() + "' as pid " + pid
                            );
                        }
                        else
                        {
                            // TODO: report error and stop the package install procedure
                            success = false;
                        }
                    }
                }
                // Import Widgets in package
                foreach (var widget in pkgData.widgets)
                {
                    homegenie.RaiseEvent(
                        Domains.HomeGenie_System,
                        Domains.HomeGenie_PackageInstaller,
                        SourceModule.Master,
                        "HomeGenie Package Installer",
                        Properties.InstallProgressMessage,
                        "= Downloading: " + widget.file.ToString()
                    );
                    Utility.FolderCleanUp(installFolder);
                    string widgetFile = Path.Combine(installFolder, widget.file.ToString());
                    if (File.Exists(widgetFile))
                        File.Delete(widgetFile);
                    using (var client = new WebClient())
                    {
                        try
                        {
                            client.DownloadFile(pkgFolderUrl + "/" + widget.file.ToString(), widgetFile);
                        }
                        catch
                        {
                            success = false;
                        }
                        client.Dispose();
                    }
                    if (success && WidgetImport(widgetFile, installFolder))
                    {
                        homegenie.RaiseEvent(
                            Domains.HomeGenie_System,
                            Domains.HomeGenie_PackageInstaller,
                            SourceModule.Master,
                            "HomeGenie Package Installer",
                            Properties.InstallProgressMessage,
                            "= Installed: '" + widget.name.ToString() + "'"
                        );
                    }
                    else
                    {
                        // TODO: report error and stop the package install procedure
                        success = false;
                    }
                }
                // Import MIG Interfaces in package
                foreach (var migface in pkgData.interfaces)
                {
                    homegenie.RaiseEvent(
                        Domains.HomeGenie_System,
                        Domains.HomeGenie_PackageInstaller,
                        SourceModule.Master,
                        "HomeGenie Package Installer",
                        Properties.InstallProgressMessage,
                        "= Downloading: " + migface.file.ToString()
                    );
                    Utility.FolderCleanUp(installFolder);
                    string migfaceFile = Path.Combine(installFolder, migface.file.ToString());
                    if (File.Exists(migfaceFile))
                        File.Delete(migfaceFile);
                    using (var client = new WebClient())
                    {
                        try
                        {
                            client.DownloadFile(pkgFolderUrl + "/" + migface.file.ToString(), migfaceFile);
                            Utility.UncompressZip(migfaceFile, installFolder);
                            File.Delete(migfaceFile);
                        }
                        catch
                        {
                            success = false;
                        }
                        client.Dispose();
                    }
                    if (success && InterfaceInstall(installFolder))
                    {
                        homegenie.RaiseEvent(
                            Domains.HomeGenie_System,
                            Domains.HomeGenie_PackageInstaller,
                            SourceModule.Master,
                            "HomeGenie Package Installer",
                            Properties.InstallProgressMessage,
                            "= Installed: '" + migface.name.ToString() + "'"
                        );
                    }
                    else
                    {
                        // TODO: report error and stop the package install procedure
                        success = false;
                    }
                }
            }
            else
            {
                success = false;
            }
            if (success)
            {
                // TODO: add package info to the list of installed packages
                // TODO: this package file must be included in the backup file also
                // TODO: and the restore process should also download and install
                // TODO: all packages included in it
                pkgData.folder_url = pkgFolderUrl;
                pkgData.install_date = DateTime.UtcNow;
                AddInstalledPackage(pkgData);


                homegenie.RaiseEvent(
                    Domains.HomeGenie_System,
                    Domains.HomeGenie_PackageInstaller,
                    SourceModule.Master,
                    "HomeGenie Package Installer",
                    Properties.InstallProgressMessage,
                    "= Status: Package Install Successful"
                );
            }
            else
            {
                homegenie.RaiseEvent(
                    Domains.HomeGenie_System,
                    Domains.HomeGenie_PackageInstaller,
                    SourceModule.Master,
                    "HomeGenie Package Installer",
                    Properties.InstallProgressMessage,
                    "= Status: Package Install Error"
                );
            }
            return success;
        }

        public dynamic GetInstalledPackage(string pkgFolderUrl)
        {
            List<dynamic> pkgList = LoadInstalledPackages();
            return pkgList.Find(p => p.folder_url.ToString() == pkgFolderUrl);
        }

        public void AddInstalledPackage(dynamic pkgObject)
        {
            List<dynamic> pkgList = LoadInstalledPackages();
            pkgList.RemoveAll(p => p.folder_url.ToString() == pkgObject.folder_url.ToString());
            pkgList.Add(pkgObject);
            File.WriteAllText("installed_packages.json", JsonConvert.SerializeObject(pkgList, Formatting.Indented));
        }

        public List<dynamic> LoadInstalledPackages()
        {
            List<dynamic> pkgList = new List<dynamic>();
            if (File.Exists("installed_packages.json"))
            {
                try
                {
                    pkgList = JArray.Parse(File.ReadAllText("installed_packages.json")).ToObject<List<dynamic>>();
                }
                catch (Exception e)
                {
                    // TODO: report exception
                }
            }
            return pkgList;
        }

        public Interface GetInterfaceConfig(string configFile)
        {
            Interface iface = null;
            using (StreamReader ifaceReader = new StreamReader(configFile))
            {
                XmlSerializer ifaceSerializer = new XmlSerializer(typeof(Interface));
                iface = (Interface)ifaceSerializer.Deserialize(ifaceReader);
                ifaceReader.Close();
            }
            return iface;
        }

        public bool WidgetImport(string archiveFile, string importPath)
        {
            bool success = false;
            List<string> extractedFiles = Utility.UncompressZip(archiveFile, importPath);
            if (File.Exists(Path.Combine(importPath, "widget.info")))
            {
                foreach (string f in extractedFiles)
                {
                    if (f.EndsWith(".html") || f.EndsWith(".js"))
                    {
                        string destFolder = Path.Combine(widgetBasePath, Path.GetDirectoryName(f));
                        if (!Directory.Exists(destFolder))
                            Directory.CreateDirectory(destFolder);
                        File.Copy(Path.Combine(importPath, f), Path.Combine(widgetBasePath, f), true);
                    }
                }
                success = true;
            }
            return success;
        }

        public ProgramBlock ProgramImport(int newPid, string archiveName, string groupName)
        {
            ProgramBlock newProgram;
            var reader = new StreamReader(archiveName);
            char[] signature = new char[2];
            reader.Read(signature, 0, 2);
            reader.Close();
            if (signature[0] == 'P' && signature[1] == 'K')
            {
                // Read and uncompress zip file content (arduino program bundle)
                string zipFileName = archiveName.Replace(".hgx", ".zip");
                if (File.Exists(zipFileName))
                    File.Delete(zipFileName);
                File.Move(archiveName, zipFileName);
                string destFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, Utility.GetTmpFolder(), "import");
                if (Directory.Exists(destFolder))
                    Directory.Delete(destFolder, true);
                Utility.UncompressZip(zipFileName, destFolder);
                string bundleFolder = Path.Combine("programs", "arduino", newPid.ToString());
                if (Directory.Exists(bundleFolder))
                    Directory.Delete(bundleFolder, true);
                if (!Directory.Exists(Path.Combine("programs", "arduino")))
                    Directory.CreateDirectory(Path.Combine("programs", "arduino"));
                Directory.Move(Path.Combine(destFolder, "src"), bundleFolder);
                reader = new StreamReader(Path.Combine(destFolder, "program.hgx"));
            }
            else
            {
                reader = new StreamReader(archiveName);
            }
            var serializer = new XmlSerializer(typeof(ProgramBlock));
            newProgram = (ProgramBlock)serializer.Deserialize(reader);
            reader.Close();

            newProgram.Address = newPid;
            newProgram.Group = groupName;
            homegenie.ProgramManager.ProgramAdd(newProgram);

            newProgram.IsEnabled = false;
            newProgram.ScriptErrors = "";
            newProgram.Engine.SetHost(homegenie);

            if (newProgram.Type.ToLower() != "arduino")
            {
                homegenie.ProgramManager.CompileScript(newProgram);
            }
            return newProgram;
        }

        public bool InterfaceInstall(string sourceFolder)
        {
            bool success = false;
            // install the interface package
            string configFile = Path.Combine(sourceFolder, "configuration.xml");
            var iface = GetInterfaceConfig(configFile);
            if (iface != null)
            {
                File.Delete(configFile);
                //
                homegenie.MigService.RemoveInterface(iface.Domain);
                //
                string configletName = iface.Domain.Substring(iface.Domain.LastIndexOf(".") + 1).ToLower();
                string configletPath = Path.Combine("html", "pages", "configure", "interfaces", "configlet", configletName + ".html");
                if (File.Exists(configletPath))
                {
                    File.Delete(configletPath);
                }
                File.Move(Path.Combine(sourceFolder, "configlet.html"), configletPath);
                //
                string logoPath = Path.Combine("html", "images", "interfaces", configletName + ".png");
                if (File.Exists(logoPath))
                {
                    File.Delete(logoPath);
                }
                File.Move(Path.Combine(sourceFolder, "logo.png"), logoPath);
                // copy other interface files to mig folder (dll and dependencies)
                string migFolder = Path.Combine("lib", "mig");
                DirectoryInfo dir = new DirectoryInfo(sourceFolder);
                foreach (var f in dir.GetFiles())
                {
                    string destFile = Path.Combine(migFolder, Path.GetFileName(f.FullName));
                    if (File.Exists(destFile))
                    {
                        try { File.Delete(destFile + ".old"); } catch { }
                        try 
                        {
                            File.Move(destFile, destFile + ".old");
                            File.Delete(destFile + ".old");
                        } catch  { }
                    }
                    File.Move(f.FullName, destFile);
                }
                //
                homegenie.SystemConfiguration.MigService.Interfaces.RemoveAll(i => i.Domain == iface.Domain);
                homegenie.SystemConfiguration.MigService.Interfaces.Add(iface);
                homegenie.SystemConfiguration.Update();
                homegenie.MigService.AddInterface(iface.Domain, iface.AssemblyName);

                success = true;
            }
            return success;
        }

    }
}

