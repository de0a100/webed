Ext.define ('Webed.controller.AddProjectBox', {
    extend: 'Ext.app.Controller',

    refs: [{
        selector: 'add-project-box', ref: 'addProjectBox'
    }],

    init: function () {
        this.control ({
            'add-project-box button[action=confirm]': {
                click: this.confirm
            },
            'add-project-box button[action=cancel]': {
                click: this.cancel
            },
            'add-project-box textfield[name=name]': {
                afterrender: this.afterrender,
                blur: this.blur
            }
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    blur: function (textfield, event) {
        if (textfield.autofocus) {
            textfield.focus (true, 25);
            textfield.autofocus = false;
        }
    },

    afterrender: function (textfield) {
        textfield.autofocus = true;
        textfield.focus (true, 25);
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    confirm: function () {
        var application = assert (this.application);
        var box = assert (this.getAddProjectBox ());
        var textfield = assert (box.down ('textfield[name=name]'));
        var combobox = assert (box.down ('combobox[name=mime]'));

        if (!textfield.isValid ()) return;
        var name = assert (textfield.getValue ());
        if (!combobox.isValid ()) return;
        var mime = assert (combobox.getValue ());

        if (mime == 'application/project+rest') {
            box.close ();
            box = Ext.create ('Webed.view.AddRestProjectBox', {project: name});
            box.show ();
            return;
        }

        var url = Ext.String.format ('/setup-project/?name={0}&mime={1}',
            encodeURIComponent (name), encodeURIComponent (mime)
        );

        Ext.Ajax.request ({
            url: url, scope: this, callback: function (opts, status, xhr) {
                if (status) {
                    var res = Ext.decode (xhr.responseText);
                    if (res.success) onSuccess (xhr, opts);
                    else onFailure (xhr, opts);
                } else {
                    onFailure (xhr, opts);
                }
            }
        });

        function onSuccess (xhr, opts) {
            var res = Ext.decode (xhr.responseText);
            assert (res.nodes && res.nodes.length > 0);
            assert (res.mime);

            var node = assert (res.nodes[0]);

            function callback (recs, op) {
                if (op.success) {
                    var records = recs.filter (function (rec) {
                        return rec.get ('uuid') == node.uuid;
                    });
                    application.fireEvent ('select_node', this, {
                        record: records[0]
                    });
                    records[0].expand ();
                } else {
                    console.error ('[AddProjectBox.confirm]', recs, op);
                }
            }

            application.fireEvent ('refresh_tree', this, {
                scope: this, callback: callback
            });
        }

        function onFailure (xhr, opts) {
            console.error ('[AddProjectBox.confirm]', xhr, opts);
        }

        box.close ();
    },

    cancel: function () {
        assert (this.getAddProjectBox ()).close ();
    }
});
