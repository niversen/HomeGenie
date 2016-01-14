[{
    // "store.script" feature field, recognized options:
    //   module:<store_name>:<item_name>
    //   program:<store_name>:<item_name>
    init: function(options) {
        this.program = this.context.program;
        this.module = this.context.module;
        this.storeLocation = options[0]; // 'program' (shared) or 'module' (private)
        this.storeName = options[1];
        this.bindItem = options[2];
        this.sourceDomain = this.storeLocation == 'program' ? this.program.Domain : this.module.Domain;
        this.sourceAddress = this.storeLocation == 'program' ? this.program.Address : this.module.Address;
    },
    bind: function() {
        var element = this.element;
        var context = this.context;
        var description = HG.WebApp.Locales.GetProgramLocaleString(context.program.Address, context.parameter.Name, context.parameter.Description);
        var html = element.html();
        html = html.replace(/{id}/g, context.parameter.Index);
        html = html.replace(/{description}/g, description);
        element.html(html);
        var editButton = element.find('[data-ui-field=editbutton]');
        var _this = this;
        editButton.on('click', function(evt){
            // open full screen editor
            $('#automation_group_module_edit').popup('close');
            $.mobile.loading('show');
            HG.Configure.Stores.ItemGet(_this.sourceDomain, _this.sourceAddress, _this.storeName, _this.bindItem, function(res){
                $.mobile.loading('hide');
                var value = res.Value;
                var title = '<small style="color:#efefef">'+_this.module.Name+' '+_this.module.Domain.split('.').pop()+':'+_this.module.Address+'</small><br/>'+_this.program.Name;
                var subtitle = context.parameter.Description+' &nbsp;&nbsp; <small style="color:#efefef">'+context.parameter.Name+'</small>';
                HG.WebApp.Utility.EditorPopup(_this.bindItem, title, subtitle, value, function(res) {
                    $('#automation_group_module_edit').popup('open');
                    if (!res.isCanceled) {
                        HG.Configure.Stores.ItemSet(_this.sourceDomain, _this.sourceAddress, _this.storeName, _this.bindItem, res.text, function(res){
                        });
                    }
                    //if (typeof _this.onChange == 'function') {
                    //    _this.onChange(...);
                    //}
                });            
            });
        });
    }
}]