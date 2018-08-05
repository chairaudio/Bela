var View = require('./View');
var popup = require('../popup');
var jsonData = require('../site-data.json');

var inputChangedTimeout;

class SettingsView extends View {
	
	constructor(className, models, settings){
		super(className, models, settings);
		//this.$elements.filter('input').on('change', (e) => this.selectChanged($(e.currentTarget), e));
		this.settings.on('change', (data) => this._IDESettings(data) );
		this.$elements.filterByData = function(prop, val) {
			return this.filter(
				function() { return $(this).data(prop)==val; }
			);
		}
		
		$('#runOnBoot').on('change', () => {
			if ($('#runOnBoot').val() && $('#runOnBoot').val() !== '--select--')
				this.emit('run-on-boot', $('#runOnBoot').val());
		});
				
		$('.audioExpanderCheck').on('change', e => {
			var inputs = '', outputs = '';
			$('.audioExpanderCheck').each(function(){
				var $this = $(this);
				if ($this.is(':checked')){
					if ($this.data('func') === 'input'){
						inputs += $this.data('channel') + ',';
					} else {
						outputs += $this.data('channel') + ',';
					}
				}
			});
			if (inputs.length) inputs = inputs.slice(0, -1);
			if (outputs.length) outputs = outputs.slice(0, -1);

			this.emit('project-settings', {func: 'setCLArgs', args: [{key: '-Y', value: inputs}, {key: '-Z', value: outputs}] });
		});
		
	}
	
	selectChanged($element, e){
		var data = $element.data();
		var func = data.func;
		var key = data.key;
		if (func && this[func]){
			this[func](func, key, $element.val());
		}
		if (key === '-C'){
			this.$elements.filterByData('key', key).not($element).val($element.val());
		}
	}
	buttonClicked($element, e){
		var func = $element.data().func;
		if (func && this[func]){
			this[func](func);
		}
	}
	inputChanged($element, e){
		var data = $element.data();
		var func = data.func;
		var key = data.key;
		var type = $element.prop('type');
		console.log(key);
		if (type === 'number' || type === 'text'){
			if (func && this[func]){
				this[func](func, key, $element.val());
			}
		} else if (type === 'checkbox'){
			if (func && this[func]){
				this[func](func, key, $element.is(':checked') ? 1 : 0);
			}
		}
	}
	
	setCLArg(func, key, value){
		this.emit('project-settings', {func, key, value});
	}
	restoreDefaultCLArgs(func){
		
		// build the popup content
		popup.title(jsonData.popups.restore_defaults_cl.title);

		popup.subtitle(jsonData.popups.restore_defaults_cl.text);
		
		var form = [];
		form.push('<button type="submit" class="button popup ' + jsonData.buttons.continue.class_name + '">' + jsonData.buttons.continue.button_text + '</button>');
		form.push('<button type="button" class="button popup ' + jsonData.buttons.cancel.class_name + '">' + jsonData.buttons.cancel.button_text + '</button>');
		
		popup.form.append(form.join('')).off('submit').on('submit', e => {
			e.preventDefault();
			this.emit('project-settings', {func});
			popup.hide();
		});
		
		// Hide popup when cancel button is clicked:
		popup.find('.' + jsonData.buttons.cancel.class_name).on('click', popup.hide );
		
		popup.show();
		
		popup.find('.' + jsonData.buttons.continue.class_name).trigger('focus');

	}
	
	setIDESetting(func, key, value){
		this.emit('IDE-settings', {func, key, value: value});
	}
	restoreDefaultIDESettings(func){
		
		// build the popup content
		popup.title(jsonData.popups.restore_defaults_ide.title);
		popup.subtitle(jsonData.popups.restore_defaults_ide.text);
		
		var form = [];
		form.push('<button type="submit" class="button popup ' + jsonData.buttons.continue.class_name + '">' + jsonData.buttons.continue.button_text + '</button>');
		form.push('<button type="button" class="button popup ' + jsonData.buttons.cancel.class_name + '">' + jsonData.buttons.cancel.button_text + '</button>');
		
		popup.form.append(form.join('')).off('submit').on('submit', e => {
			e.preventDefault();
			this.emit('IDE-settings', {func});
			popup.hide();
		});
		
		popup.find('.' + jsonData.buttons.cancel.class_name).on('click', popup.hide );
		
		popup.show();
		
		popup.find('.' + jsonData.buttons.continue.class_name).trigger('focus');
		
	}
	
	shutdownBBB(){
	
		// build the popup content
		popup.title(jsonData.popups.shutdown.title);
		popup.subtitle(jsonData.popups.shutdown.text);
		
		var form = [];
		form.push('<button type="submit" class="button popup ' + jsonData.buttons.continue.class_name + '">' + jsonData.buttons.continue.button_text + '</button>');
		form.push('<button type="button" class="button popup ' + jsonData.buttons.cancel.class_name + '">' + jsonData.buttons.cancel.button_text + '</button>');
		
		popup.form.append(form.join('')).off('submit').on('submit', e => {
			e.preventDefault();
			this.emit('halt');
			popup.hide();
		});
		
		popup.find('.' + jsonData.buttons.cancel.class_name).on('click', popup.hide );
		
		popup.show();
		
		popup.find('.' + jsonData.buttons.continue.class_name).trigger('focus');
	
	}
	aboutPopup(){
		
		// build the popup content
		popup.title(jsonData.popups.about_bela.title);
		popup.subtitle(jsonData.popups.about_bela.text);
		var form = [];
		form.push('<button type="submit" class="button popup ' + jsonData.buttons.ok.class_name + '">' + jsonData.buttons.ok.button_text + '</button>');
		
		popup.form.append(form.join('')).off('submit').on('submit', e => {
			e.preventDefault();
			popup.hide();
		});
				
		popup.show();
		
		popup.find('.' + jsonData.buttons.ok.class_name).trigger('focus');
		
	}
	updateBela(){
	
		// build the popup content
		popup.title(jsonData.popups.update.title);
		popup.subtitle(jsonData.popups.update.text);
		
		var form = [];
		form.push('<input id="popup-update-file" type="file">');
		form.push('</br>');
		form.push('<button type="submit" class="button popup ' + jsonData.buttons.update.class_name + '">' + jsonData.buttons.update.button_text + '</button>');
		form.push('<button type="button" class="button popup ' + jsonData.buttons.cancel.class_name + '">' + jsonData.buttons.cancel.button_text + '</button>');

		/*popup.form.prop({
			action	: 'updates',
			method	: 'get',
			enctype	: 'multipart/form-data'
		});*/
		
		popup.form.append(form.join('')).off('submit').on('submit', e => {
		
			//console.log('submitted', e);
			
			e.preventDefault();
			
			var file = popup.find('input[type=file]').prop('files')[0];
			
			//console.log('input', popup.find('input[type=file]'));
			//console.log('file', file);
			
			if (file){
			
				this.emit('warning', jsonData.warnings.update.1);
				this.emit('warning', jsonData.warnings.update.2);
				this.emit('warning', jsonData.warnings.update.3);
				
				popup.hide('keep overlay');
				
				var reader = new FileReader();
				reader.onload = (ev) => this.emit('upload-update', {name: file.name, file: ev.target.result} );
				reader.readAsArrayBuffer(file);
				
			} else {
			
				this.emit('warning', jsonData.warnings.invalid_zip);
				popup.hide();
				
			}
			
		});
		
		popup.find('.' + jsonData.buttons.cancel.class_name).on('click', popup.hide );
				
		popup.show();
		
	}
	
	// model events
	__CLArgs(data){

		for (let key in data) {
		
			if (key === '-Y' || key === '-Z'){
				this.setAudioExpander(key, data[key]);
				continue;
			} else if (key === 'audioExpander'){
				if (data[key] == 1)
					$('#audioExpanderTable').css('display', 'table');
				else
					$('#audioExpanderTable').css('display', 'none');
			}
		
			let el = this.$elements.filterByData('key', key);

			// set the input value
			if (el[0].type === 'checkbox') {
				el.prop('checked', (data[key] == 1));
			} else {
				//console.log(el.val(), data[key]);
				el.val(data[key]);
			}
			
			
		}

	}
	_IDESettings(data){
		for (let key in data){
			this.$elements.filterByData('key', key).val(data[key]).prop('checked', data[key]);
		}
	}
	_projectList(projects, data){

		var $projects = $('#runOnBoot');
		$projects.empty();
		
		// add an empty option to menu and select it
		$('<option></option>').html('--select--').appendTo($projects);
		
		// add a 'none' option
		$('<option></option>').attr('value', 'none').html('none').appendTo($projects);

		// fill project menu with projects
		for (let i=0; i<projects.length; i++){
			if (projects[i] && projects[i] !== 'undefined' && projects[i] !== 'exampleTempProject' && projects[i][0] !== '.'){
				$('<option></option>').attr('value', projects[i]).html(projects[i]).appendTo($projects);
			}
		}
		
	}
	
	useAudioExpander(func, key, val){
		
		if (val == 1) {
			$('#audioExpanderTable').css('display', 'table');
			this.setCLArg('setCLArg', key, val);
		} else {
			$('#audioExpanderTable').css('display', 'none');
			// clear channel picker
			$('.audioExpanderCheck').prop('checked', false);
			this.emit('project-settings', {func: 'setCLArgs', args: [
				{key: '-Y', value: ''}, 
				{key: '-Z', value: ''},
				{key, value: val}
			] });
		}
	}
	
	setAudioExpander(key, val){
		
		if (!val.length) return;
		
		var channels = val.split(',');

		if (!channels.length) return;
		
		$('.audioExpanderCheck').each( function(){
			let $this = $(this);
			if (($this.data('func') === 'input' && key === '-Y') || ($this.data('func') === 'output' && key === '-Z')){
				let checked = false;
				for (let channel of channels){
					if (channel == $this.data('channel'))
						checked = true;
				}	
				$this.prop('checked', checked);	
			}
		});
		
	}
}

module.exports = SettingsView;
