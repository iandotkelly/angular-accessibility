/**
 * Angular Directives For Accessible User Interface Widgets
 *
 * Copyright (C) Ian Kelly 2013-4
 */

'use strict';

(function() {
	
	var angularAccessibility = angular.module('angular-accessibility', []);

	/**
	* Directive for accessible forms
	*/
	angularAccessibility.directive('accessibleForm', function ($log) {
		return {
			retrict: 'A',
			link: function (scope, elem, attr, ctrl) {

				// it must have a name attribute
				if (!attr.name) {
					$log.error('accessibleForm must have a name attribute');
					return;
				}

				// the form is found on the scope by
				// its name property
				var form = scope[attr.name];

				// add a function that can focus the first element
				// to the scope, it might be useful elsewhere
				scope.focusFirst = function() {
					// makes use of the fact that the inputs
					// are in the order they appear on the page
					for (var key in form) {
						if (form.hasOwnProperty(key) && key.indexOf('$') !== 0) {
							var input = form[key];
							if (input.$invalid) {
								if (input.focus) {
									input.focus();
								}
								return true;
							}
						}
					}
					return false;
				};

				// handle the submit event
				elem.on('submit', function(e) {
					if (scope.focusFirst()) {
						e.preventDefault();
					}
				});
			}
		};
	});

	/**
	* Directive for an accessible checkbox
	*/
	angularAccessibility.directive('aCheckbox', function ($log, $compile) {
		return {
			restrict: 'E',
			requires: '^accessibleForm',
			template: ['<fieldset class="form-group">',
				'<div class="sr-only"></div>',
				'<label class="col-sm-3 control-label"></label>',
				'<div class="col-sm-7">',
				'<input type="checkbox" class="form-control"></input>',
				'</div>',
				'</fieldset>'].join(''),
			link: function (scope, aCheckbox, attributes) {
				/* jshint maxstatements: 50 */

				var eLabel, eHelp, eInput, eFieldset, children, id;

				// the fieldset - should be the only child
				eFieldset = aCheckbox.children().eq(0);
				// the help and label
				children = eFieldset.children();
				eHelp = children.eq(0);
				eLabel = children.eq(1);
				// the input
				eInput = children.eq(2).children().eq(0);

				// get the id of the input
				id = attributes.id + '-checkbox';

				// set the help div up
				eHelp.attr('id', id + '-help');
				eHelp.text(attributes.help);

				// set the label up
				eLabel.attr('for', id);
				eLabel.text(attributes.label);

				// se the input up
				eInput.attr('id', id);
				eInput.attr('aria-describedby', id + '-help');
				eInput.attr('ng-model', attributes['ng-model']);

				// replace the input with the new fieldset
				aCheckbox.replaceWith(eFieldset);

				// recompile the created markup
				$compile(eFieldset)(scope);
			}
		};
	});


	/**
	* Directive for an Accessible Checbox Group <a-checklist> Element
	*/

	angularAccessibility.directive('aChecklist', function ($compile, $log) {
		return {
			// this is an element defintion
			restrict: 'E',
			// it must be contained in an accessible form
			requires: '^accessibleForm',
			// the template
			template: ['<fieldset class="form-group">',
				'<legend class="col-sm-3 control-label horizontal"></legend>',
				'<div class="col-sm-7">',
				'<div class="checkbox">',
				'<label>',
				'<input type="checkbox"></input>',
				'</label>',
				'</div></div>',
				'</fieldset>'].join(''),
			// converts the template to the final state
			link: function (scope, aInput, attributes) {
				/* jshint maxstatements: 50 */

				var eLegend, eLabel, eRepeat, eInput, eFieldset, name;

				// @todo - consider reverting this to jqLite
				eFieldset = aInput.children('fieldset');
				eLegend = eFieldset.children('legend');
				eRepeat = eFieldset.find('div.checkbox');
				eLabel =  eRepeat.children('label');
				eInput = eLabel.children('input');

				// iterate over all the attributes of the a-checkboxgroup
				// and assign them to the appropriate part of the template
				for (name in attributes.$attr) {
					if (attributes.$attr.hasOwnProperty(name)) {
						switch (name) {
						case 'legend':
							eLegend.text(attributes.legend);
							break;
						case 'label':
							eLabel.prepend('{{' + attributes.label + '}}');
							break;
						case 'repeat':
							eRepeat.attr('ng-repeat', attributes.repeat);
							break;
						case 'modelArray':
							eInput.attr('checklist-model', attributes.modelArray);
							break;
						case 'modelValue':
							eInput.attr('checklist-value', attributes.modelValue);
							break;
						default:
							// by default move the attribute to the input
							eInput.attr(attributes.$attr[name], attributes[name]);
							break;
						}
					}
				}

				// replace the input with the new fieldset
				aInput.replaceWith(eFieldset);

				// recompile the created markup
				// to expand the repeat and apply any other directives
				$compile(eFieldset)(scope);
			}
		};
	});


	/**
	* Directive for an Accessible Input <a-input> Element
	*/
	angularAccessibility.directive('aInput', function ($compile) {
		return {
			// this is an element defintion
			restrict: 'E',
			// it must be contained in an accessible form
			requires: '^accessibleForm',
			// the template
			template: ['<fieldset class="form-group">',
				'<div class="sr-only"></div>',
				'<div class="col-sm-7 col-sm-offset-3"></div>',
				'<label class="col-sm-3 control-label"></label>',
				'<div class="col-sm-7">',
				'<input blur-focus class="form-control"></input>',
				'</div>',
				'</fieldset>'].join(''),
			// converts the template to the final state
			link: function (scope, aInput, attributes) {
				/* jshint maxstatements: 50 */

				var eLabel, eHelp, eError, eInput, inputName,
					eFieldset, name, children, attributeName, formName, id;

				// the fieldset - should be the only child
				eFieldset = aInput.children().eq(0);
				// the help, error and label
				children = eFieldset.children();
				eHelp = children.eq(0);
				eError = children.eq(1);
				eLabel = children.eq(2);
				eInput = children.eq(3).children().eq(0);

				// iterate over all the attributes of the a-input
				// and assign them to the appropriate part of the template
				for (name in attributes.$attr) {
					if (attributes.$attr.hasOwnProperty(name)) {
						attributeName = attributes.$attr[name];
						switch (name) {
						case 'id':
							id = attributes.id + '-input';
							eHelp.attr('id', id + '-help');
							eError.attr('id', id + '-error');
							eInput.attr('id', id);
							eLabel.attr('for', id);
							break;
						case 'help':
							// set the help text
							eHelp.text(attributes[name]);
							break;
						case 'error':
							// set the help text
							eError.text(attributes[name]);
							break;
						case 'label':
							// set the help text
							eLabel.text(attributes[name]);
							break;
						case 'required':
							eInput.attr('required', 'true');
							eInput.attr('aria-required', 'true');
							break;
						default:
							// by default move the attribute to the input
							eInput.attr(attributeName, attributes[name]);
							break;
						}
						//aInput.removeAttr(attributeName);
					}
				}

				// find the accessible form name
				formName = aInput.closest('form').attr('name');
				inputName = formName + '.' + eInput.attr('name');
				// set up the validation failures
				eFieldset.attr('ng-class',
					'{\'has-error\': ' + inputName + '.failsValidation()}');
				eError.attr('ng-show', inputName + '.failsValidation()');
				eInput.attr('aria-invalid', '{{' + inputName + '.failsValidation()}}');
				eInput.attr('aria-describedby',
					eHelp.attr('id') + ' {{' + inputName + '.validationId()}}');
				eInput.attr('error-id', eError.attr('id'));

				// replace the input with the new fieldset
				aInput.replaceWith(eFieldset);

				// recompile the created markup - to apply blur-focus to the input
				$compile(eFieldset)(scope);
			}
		};
	});


	/**
	* Directive for an Accessible Input <a-input> Element
	*/
	angularAccessibility.directive('aSelect', function ($compile) {
		return {
			// this is an element defintion
			restrict: 'E',
			// it must be contained in an accessible form
			requires: '^accessibleForm',
			// the template
			template: ['<fieldset class="form-group">',
				'<div class="sr-only"></div>',
				'<div class="col-sm-7 col-sm-offset-3"></div>',
				'<label class="col-sm-3 control-label"></label>',
				'<div class="col-sm-7">',
				'<select blur-focus class="form-control"></input>',
				'</div>',
				'</fieldset>'].join(''),
			// converts the template to the final state
			link: function (scope, aSelect, attributes) {
				/* jshint maxstatements: 50 */

				var eLabel, eHelp, eError, eSelect, inputName,
					eFieldset, name, children, attributeName, formName, id;

				// the fieldset - should be the only child
				eFieldset = aSelect.children().eq(0);
				// the help, error and label
				children = eFieldset.children();
				eHelp = children.eq(0);
				eError = children.eq(1);
				eLabel = children.eq(2);
				eSelect = children.eq(3).children().eq(0);

				// iterate over all the attributes of the a-input
				// and assign them to the appropriate part of the template
				for (name in attributes.$attr) {
					if (attributes.$attr.hasOwnProperty(name)) {
						attributeName = attributes.$attr[name];
						switch (name) {
						case 'id':
							id = attributes.id + '-input';
							eHelp.attr('id', id + '-help');
							eError.attr('id', id + '-error');
							eSelect.attr('id', id);
							eLabel.attr('for', id);
							break;
						case 'help':
							// set the help text
							eHelp.text(attributes[name]);
							break;
						case 'error':
							// set the help text
							eError.text(attributes[name]);
							break;
						case 'label':
							// set the help text
							eLabel.text(attributes[name]);
							break;
						case 'required':
							eSelect.attr('required', 'true');
							eSelect.attr('aria-required', 'true');
							break;
						default:
							// by default move the attribute to the input
							eSelect.attr(attributeName, attributes[name]);
							break;
						}
					}
				}

				// find the accessible form name
				formName = aSelect.closest('form').attr('name');
				inputName = formName + '.' + eSelect.attr('name');
				// set up the validation failures
				eFieldset.attr('ng-class',
					'{\'has-error\': ' + inputName + '.failsValidation()}');
				eError.attr('ng-show', inputName + '.failsValidation()');
				eSelect.attr('aria-invalid', '{{' + inputName + '.failsValidation()}}');
				eSelect.attr('aria-describedby',
					eHelp.attr('id') + ' {{' + inputName + '.validationId()}}');
				eSelect.attr('error-id', eError.attr('id'));

				// replace the input with the new fieldset
				aSelect.replaceWith(eFieldset);

				// recompile the created markup - to apply blur-focus to the input
				$compile(eFieldset)(scope);
			}
		};
	});

	/**
	* Directive to detect visited state of all input fields
	*/
	angularAccessibility.directive('blurFocus', function ($log) {
		return {
			require: '?ngModel',
			link: function (scope, element, attrs, ctrl) {

				$log.log('wohoo');
				$log.log(ctrl);

				if (!ctrl) {
					return;
				}

				// this stops it applying to checkboxes
				if (element.attr('type') === 'checkbox') {
					return;
				}

				/**
				* Focuses the element of this input
				*/
				ctrl.focus = function () {
					element.focus();
				};

				/**
				* Whether the control fails validation
				* @return {Boolean} True = fails validation
				*/
				ctrl.failsValidation = function () {
					return !!ctrl.hasVisited && !!ctrl.$invalid;
				};

				/**
				* The ID of a validation error element
				* @return {String} Falsy = no validation message
				*                  String = ID of validation message
				*/
				ctrl.validationId = function () {
					if (ctrl.failsValidation()) {
						return element.attr('error-id');
					}
				};

				// on focus note that
				element.on('focus', function () {
					element.addClass('has-focus');

					scope.$apply(function () {
						ctrl.hasFocus = true;
					});
				});

				// on blur apply the had visited property
				element.on('blur', function () {
					$log.log('blur');
					element.removeClass('has-focus');
					element.addClass('has-visited');

					scope.$apply(function () {
						ctrl.hasFocus = false;
						ctrl.hasVisited = true;
					});
				});

				// if the form submits - assume we've visted all the fields
				element.closest('form').on('submit', function () {
					element.addClass('has-visited');

					scope.$apply(function () {
						ctrl.hasFocus = false;
						ctrl.hasVisited = true;
					});
				});
			}
		};
	});

})();
