Ext.define ('Webed.controller.window.AddRestProjectBox', {
    extend: 'Ext.app.Controller',

    refs: [{
        selector: 'add-rest-project-box', ref: 'addRestProjectBox'
    }],

    init: function () {
        this.control ({
            'add-rest-project-box button[action=confirm]': {
                click: this.confirm
            },
            'add-rest-project-box button[action=cancel]': {
              click: this.cancel
            },
            'add-rest-project-box': {
                render: this.render
            }
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    render: function (self) {
        var source = {}; for (var name in self.config) {
            if (self.config.hasOwnProperty (name)) {
                source[name] = self.getConfig (name);
            }
        }

        var grid = assert (self.down ('propertygrid'));
        grid.setSource (source);
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    confirm: function () {
        var application = assert (this.application);
        var box = assert (this.getAddRestProjectBox ());
        var mime = assert (box.mime);
        var grid = assert (box.down ('propertygrid'));
        var source = Ext.apply (grid.getSource (), {
            mime: mime
        });

        var url = Ext.String.format ('/setup-rest-project/?' +
            'name={0}&' +
            'mime={1}&' +
            'authors={2}&' +
            'documentType={3}&' +
            'fontSize={4}&' +
            'noColumns={5}&' +
            'titleFlag={6}&' +
            'tocFlag={7}&' +
            'indexFlag={8}&' +
            'backend={9}',

            encodeURIComponent (source.project),
            encodeURIComponent (source.mime),
            encodeURIComponent (source.authors),
            encodeURIComponent (source.documentType),
            encodeURIComponent (source.fontSize),
            encodeURIComponent (source.noColumns),
            encodeURIComponent (source.titleFlag),
            encodeURIComponent (source.tocFlag),
            encodeURIComponent (source.indexFlag),
            encodeURIComponent (source.backend)
        );

        function onSuccess (xhr) {
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

                TRACKER.event ({
                    category: 'AddProjectBox', action: 'confirm', label: mime,
                    value: (op && op.success) ? 1 : 0
                });
            }

            application.fireEvent ('refresh_tree', this, {
                scope: this, callback: callback
            });
        }

        function onFailure (xhr, opts) {
            TRACKER.event ({
                category: 'AddProjectBox', action: 'confirm', label: mime,
                value: 0
            });

            console.error ('[AddRestProjectBox.confirm]', xhr, opts);
        }

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

        box.close ();
    },

    cancel: function () {
        TRACKER.event ({
            category: 'AddProjectBox', action: 'cancel', value: 1
        });

        assert (this.getAddRestProjectBox ()).close ();
    }
});
