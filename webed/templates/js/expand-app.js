function expand_app (self) {
    var viewport = Ext.ComponentQuery.query ('viewport').pop ();
    if (viewport) {
        var projects = viewport.down ('panel[name=projects]');
        if (projects) projects.expand ();
    }
}
