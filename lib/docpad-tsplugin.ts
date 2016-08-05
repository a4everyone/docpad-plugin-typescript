
declare let arguments: any[] 

// Base plugin framework for DocPad plugins written in javascript.
var __hasProp = {}.hasOwnProperty;
    
var __extends =  (child, parent) => {
    for (var key in parent) { 
        if (__hasProp.call(parent, key)) 
            child[key] = parent[key]; 
    } 
     
    var original_child_prototype = child.prototype;
    
    function __() { 
        this.constructor = child; 
    }
    
    child.__super__ = parent.prototype;
    __.prototype = parent.prototype;
    
    Object.keys(original_child_prototype).concat( Object.keys(parent.prototype)).forEach( function(value, index, ar) { 
        this[value] = original_child_prototype[value] || parent.prototype[value];
    }, child.prototype = new __() ) ;
    
    return child;
};

// since typescript ever-so-conveniently messes with the scoped 'module'
arguments[2].exports = (pluginName, pluginClass) => {
    return (_super) => {
        __extends( pluginClass , _super );
        pluginClass.prototype.name = pluginName;
        return pluginClass;
    }
};
