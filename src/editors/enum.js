// Enum Editor (used for objects and arrays with enumerated values)
JSONEditor.defaults.editors['enum'] = JSONEditor.AbstractEditor.extend({
  getDefault: function() {
    return this.schema['enum'][0];
  },
  addProperty: function() {
    this._super();
    this.display_area.style.display = '';
    this.theme.enableHeader(this.title);
  },
  removeProperty: function() {
    this._super();
    this.display_area.style.display = 'none';
    this.theme.disableHeader(this.title);
  },
  getNumColumns: function() {
    return 4;
  },
  build: function() {
    var container = this.getContainer();
    this.title = this.header = this.label = this.getTheme().getFormInputLabel(this.getTitle());
    this.container.appendChild(this.title);

    this.options.enum_titles = this.options.enum_titles || [];

    this['enum'] = this.schema['enum'];
    this.selected = 0;
    this.select_options = [];
    this.html_values = [];

    var self = this;
    for(var i=0; i<this['enum'].length; i++) {
      this.select_options[i] = this.options.enum_titles[i] || "Value "+(i+1);
      this.html_values[i] = this.getHTML(this['enum'][i]);
    }

    // Switcher
    this.switcher = this.theme.getSwitcher(this.select_options);
    this.container.appendChild(this.switcher);
    this.switcher.style.width = 'auto';
    this.switcher.style.display = 'inline-block';
    this.switcher.style.marginLeft = '5px';
    this.switcher.style.marginBottom = 0;

    // Display area
    this.display_area = this.theme.getIndentedPanel();
    this.display_area.style.paddingTop = 0;
    this.display_area.style.paddingBottom = 0;
    this.container.appendChild(this.display_area);

    this.switcher.addEventListener('change',function() {
      self.selected = self.select_options.indexOf(this.value);
      self.value = self['enum'][self.selected];
      self.refreshValue();
      
      if(self.parent) self.parent.onChildEditorChange(self);
      else self.jsoneditor.onChange();
    });
    this.value = this['enum'][0];
    this.refreshValue();
    this.jsoneditor.notifyWatchers(this.path);

    if(this['enum'].length === 1) this.switcher.style.display = 'none';
  },
  refreshValue: function() {
    var self = this;
    self.selected = -1;
    var stringified = JSON.stringify(this.value);
    $each(this['enum'], function(i, el) {
      if(stringified === JSON.stringify(el)) {
        self.selected = i;
        return false;
      }
    });

    if(self.selected<0) {
      self.setValue(self['enum'][0]);
      return;
    }

    this.switcher.value = this.select_options[this.selected];
    this.display_area.innerHTML = this.html_values[this.selected];
  },
  enable: function() {
    if(!this.always_disabled) this.switcher.disabled = false;
    this._super();
  },
  disable: function() {
    this.switcher.disabled = true;
    this._super();
  },
  getHTML: function(el) {
    var self = this;

    if(el === null) {
      return '<em>null</em>';
    }
    // Array or Object
    else if(typeof el === "object") {
      // TODO: use theme
      var ret = '';

      $each(el,function(i,child) {
        var html = self.getHTML(child);

        // Add the keys to object children
        if(!(el instanceof Array)) {
          // TODO: use theme
          html = '<div><em>'+i+'</em>: '+html+'</div>';
        }

        // TODO: use theme
        ret += '<li>'+html+'</li>';
      });
      
      if(el instanceof Array) ret = '<ol>'+ret+'</ol>';
      else ret = "<ul style='margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;'>"+ret+'</ul>';

      return ret;
    }
    // Boolean
    else if(typeof el === "boolean") {
      return el? 'true' : 'false';
    }
    // String
    else if(typeof el === "string") {
      return el.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    // Number
    else {
      return el;
    }
  },
  setValue: function(val) {
    if(this.value !== val) {
      this.value = val;
      this.refreshValue();
      this.jsoneditor.notifyWatchers(this.path);
    }
  },
  destroy: function() {
    this.display_area.parentNode.removeChild(this.display_area);
    this.title.parentNode.removeChild(this.title);
    this.switcher.parentNode.removeChild(this.switcher);

    this._super();
  }
});
