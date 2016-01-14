//
// namespace : HG.Configure.Groups namespace
// info      : -
//
HG.Configure = HG.Configure || {};
//
HG.Configure.LoadData = function (callback) {
    HG.Configure.Modules.List(function (data) {
        try {
            HG.WebApp.Data.Modules = eval(data);
        } catch (e) { }
        //
        HG.Automation.Programs.List(function () {
            HG.Configure.Groups.List('Control', function () {

                if (callback != null) callback();

            });
        });
    });
};
//
HG.Configure.Groups = HG.Configure.Groups || {};
HG.Configure.Groups.ModulesList = function (groupname, callback) {
    $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.ModulesList/' + groupname + '/', function (data) {
        callback(data);
    });
};

HG.Configure.Groups.List = function (context, callback) {
    $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.List/' + context + '/', function (data) {
        if (context == 'Automation') {
            HG.WebApp.Data.AutomationGroups = data;
        }
        else {
            HG.WebApp.Data.Groups = data;
        }
        callback();
    });
};

HG.Configure.Groups.Sort = function (context, sortorder, callback) {
    $.ajax({
        type: 'POST',
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Sort/' + context + '/',
        data: sortorder,
        success: function (response) {
            callback(response);
        },
        error: function (a, b, c) {
            alert('A problem ocurred');
        }
    });
};

HG.Configure.Groups.SortModules = function (context, groupname, sortorder, callback) {
    $.ajax({
        type: 'POST',
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.SortModules/' + context + '/' + groupname + '/',
        data: sortorder,
        success: function (response) {
            callback(response);
        },
        error: function (a, b, c) {
            alert('A problem ocurred');
        }
    });
};


HG.Configure.Groups.RenameGroup = function (context, oldname, newname, callback) {
    $.ajax({
        type: 'POST',
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Rename/' + context + '/' + oldname + '/',
        data: newname,
        success: function (response) {
            callback(response);
        },
        error: function (a, b, c) {
            alert('Error.\nThere is aready a group with this name.');
        }
    });
};


HG.Configure.Groups.AddGroup = function (context, group, callback) {
    $.ajax({
        type: 'POST',
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Add/' + context + '/',
        data: group,
        success: function (response) {
            callback();
        },
        error: function (a, b, c) {
            alert('A problem ocurred');
        }
    });
};
HG.Configure.Groups.DeleteGroup = function (context, group, callback) {
    $.ajax({
        type: 'POST',
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Delete/' + context + '/',
        data: group,
        success: function (response) {
            callback();
        },
        error: function (a, b, c) {
            alert('A problem ocurred');
        }
    });
};

HG.Configure.Groups.GetGroupModules = function (groupname) {
    var groupmodules = { 'Index': 0, 'Name': groupname, 'Modules': Array() };
    var group = HG.Configure.Groups.GetGroupByName(groupname);
    groupmodules.Index = group.Index;
    for (var c = 0; c < group.Modules.length; c++) {
        var found = false;
        //
        for (var m = 0; m < HG.WebApp.Data.Modules.length; m++) {
            if (HG.WebApp.Data.Modules[m].Domain == group.Modules[c].Domain && HG.WebApp.Data.Modules[m].Address == group.Modules[c].Address) {
                groupmodules.Modules.push(HG.WebApp.Data.Modules[m]);
                found = true;
                break;
            }
        }
        //
        if (!found) {
            // orphan module/program, it is not present in the modules list nor programs one
            groupmodules.Modules.push(group.Modules[c]);
        }
    }
    return groupmodules;
};
HG.Configure.Groups.GetGroupByName = function(name) {
    var group = null;
    for (var i = 0; i < HG.WebApp.Data.Groups.length; i++) {
        if (HG.WebApp.Data.Groups[i].Name == name) {
            group = HG.WebApp.Data.Groups[i];
            group.Index = i;
            break;
        }
    }
    return group;
};
HG.Configure.Groups.WallpaperList = function (callback) {
    $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.WallpaperList/', function (data) {
        HG.WebApp.Data.Wallpapers = eval(arguments[2].responseText);
        callback(HG.WebApp.Data.Wallpapers);
    });
};
HG.Configure.Groups.WallpaperSet = function (group, wallpaper, callback) {
    $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.WallpaperSet/' + encodeURIComponent(group) + '/' + encodeURIComponent(wallpaper) + '/', function (data) {
        callback();
    });    
};
HG.Configure.Groups.WallpaperDelete = function (wallpaper, callback) {
    $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.WallpaperDelete/' + encodeURIComponent(wallpaper) + '/', function (data) {
        callback();
    });    
};

//
// namespace : HG.Configure.Interfaces namespace
// info      : -
//
HG.Configure.Interfaces = HG.Configure.Interfaces || {};
HG.Configure.Interfaces.ServiceCall = function (ifacefn, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Interfaces.Configure/' + ifacefn + '/',
        type: 'GET',
        success: function (data) {
            callback(data);
        }
    });
};
HG.Configure.Interfaces.ListConfig = function (callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Interfaces.ListConfig/',
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};

HG.Configure.MIG = HG.Configure.MIG || {};
HG.Configure.MIG.InterfaceCommand = function (domain, command, option1, option2, callback) {
    $.get('/' + HG.WebApp.Data.ServiceKey + '/MIGService.Interfaces/' + domain + '/' + command + '/' + option1 + '/' + option2 + '/', function (data) {
        if (callback) callback(data);
    });
};
//
// namespace : HG.Configure.Modules namespace
// info      : -
//  
HG.Configure.Stores = HG.Configure.Stores || {};
HG.Configure.Stores.ItemGet = function (domain, address, store, item, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Stores.ItemGet/' + domain + '/' + address + '/' + store + '/' + item + '/',
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
HG.Configure.Stores.ItemSet = function (domain, address, store, item, value, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Stores.ItemSet/' + domain + '/' + address + '/' + store + '/' + item + '/',
        type: 'POST',
        data: value,
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
HG.Configure.Stores.ItemDelete = function (domain, address, store, item, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Stores.ItemDelete/' + domain + '/' + address + '/' + store + '/' + item + '/',
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
HG.Configure.Stores.ItemList = function (domain, address, store, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Stores.ItemList/' + domain + '/' + address + '/' + store + '/',
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
//
// namespace : HG.Configure.Modules namespace
// info      : -
//	
HG.Configure.Modules = HG.Configure.Modules || {};
HG.Configure.Modules.List = function (callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Modules.List/',
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
HG.Configure.Modules.Get = function (domain, address, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Modules.Get/' + domain + '/' + address + '/',
        type: 'GET',
        dataType: 'text',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
HG.Configure.Modules.Delete = function (domain, address, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Modules.Delete/' + domain + '/' + address + '/',
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
HG.Configure.Modules.RoutingReset = function (callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Modules.RoutingReset/',
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
HG.Configure.Modules.ParameterSet = function (domain, address, parameter, value, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Modules.ParameterSet/' + domain + '/' + address + '/' + parameter + '/' + encodeURIComponent(value),
        type: 'GET',
        success: function (data) {
            if (typeof callback != 'undefined' && callback != null) callback(data);
        }
    });
};
//
HG.Configure.Widgets = HG.Configure.Widgets || {};
HG.Configure.Widgets.List = function(callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Widgets.List/',
        type: 'GET',
        success: function (data) {
            callback(data);
        }
    });
};
HG.Configure.Widgets.Save = function(widgetPath, fileType, content, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Widgets.Save/' + fileType + '/' + encodeURIComponent(widgetPath),
        type: 'POST',
        data: content,
        processData: false,
        success: function (data) {
            if (callback)
                callback(data);
        },
        error: function (a, b, c) {
            if (callback) callback({ 'Status' : 'Error' });
        }
    });
};
HG.Configure.Widgets.Add = function(widgetPath, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Widgets.Add/' + encodeURIComponent(widgetPath),
        type: 'GET',
        success: function (data) {
            if (callback)
                callback(data);
        },
        error: function (a, b, c) {
            if (callback) callback({ 'Status' : 'Error' });
        }
    });
};
HG.Configure.Widgets.Delete = function(widgetPath, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Widgets.Delete/' + encodeURIComponent(widgetPath),
        type: 'GET',
        success: function (data) {
            if (callback)
                callback(data);
        },
        error: function (a, b, c) {
            if (callback) callback({ 'Status' : 'Error' });
        }
    });
};
HG.Configure.Widgets.Export = function(widgetPath) {
    
};
HG.Configure.Widgets.Parse = function(content, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Widgets.Parse/',
        type: 'POST',
        data: content,
        processData: false,
        success: function (data) {
            if (callback) {
                if (typeof data.ResponseValue != 'undefined')
                    data.ResponseValue = decodeURIComponent(data.ResponseValue);
                callback(data);
            }
        },
        error: function (a, b, c) {
            if (callback) callback({ 'ResponseValue' : 'ERROR' });
        }
    });
};
//
// namespace : HG.Configure.System namespace
// info      : -
//	
HG.Configure.System = HG.Configure.System || {};
HG.Configure.System.ServiceCall = function (systemfn, callback) {
    $.ajax({
        url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/System.Configure/' + systemfn + '/',
        type: 'GET',
        success: function (data) {
            if (typeof data.ResponseValue != 'undefined')
                data = data.ResponseValue;
            callback(data);
        }
    });
};
