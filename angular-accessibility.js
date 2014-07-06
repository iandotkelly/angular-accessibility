/**
 * Angular Directives For Accessible User Interface Widgets
 *
 * Copyright (C) Ian Kelly 2013-4
 */

'use strict';

(function() {

	var angularAccessibility = angular.module('angular-accessibility', []);

	/**
	 * Constants
	 */
	angularAccessibility.constant('MODULE_VERSION', '0.0.0');

	/**
	 * Simple implementation of closest
	 *
	 * @param  {String} name	The name of the tag to find
	 * @return {Object|Boolean} The parent element with that name, or false
	 */
	angular.element.prototype.closest = function (name) {

		var cur, tagName;

		name = name.toUpperCase();

		for (cur = this; cur; cur = cur.parent()) {
			tagName = cur.prop('tagName');
			if (tagName === 'BODY') {
				break;
			}
			if (tagName === name) {
				return cur;
			}
		}

		return false;
	};


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
			template: ['<fieldset class="aa-fieldset">',
							'<div class="sr-only"></div>',
							'<label class="aa-label"></label>',
							'<div class="aa-inputwrap">',
								'<input type="checkbox" class="aa-input"></input>',
							'</div>',
						'</fieldset>'].join(''),
			link: function (scope, aCheckbox, attributes) {
				/* jshint maxstatements: 20 */

				var eFieldset = aCheckbox.children().eq(0);
				var children = eFieldset.children();
				var eHelp = children.eq(0);
				var eLabel = children.eq(1);
				var eInputWrap = children.eq(2);
				var eInput = eInputWrap.children().eq(0);

				// get the id of the input
				var id = attributes.id + '-checkbox';

				// set the fieldset up
				eFieldset.addClass(attributes.classFieldset);

				// set the help div up
				eHelp.attr('id', id + '-help');
				eHelp.text(attributes.help);

				// set the label up
				eLabel.attr('for', id);
				eLabel.text(attributes.label);
				eLabel.addClass(attributes.classLabel);

				// set the input up
				eInput.attr('id', id);
				eInput.attr('aria-describedby', id + '-help');
				eInput.attr('ng-model', attributes['ng-model']);
				eInput.addClass(attributes.class);
				eInputWrap.addClass(attributes.classInputwrap);

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
			template: ['<fieldset class="aa-fieldset">',
							'<legend class="aa-legend"></legend>',
							'<div class="aa-checkbox-group">',
								'<div class="aa-checkbox">',
									'<input type="checkbox" class="aa-checkbox-input"></input>',
									'<label class="aa-checkbox-label"></label>',
								'</div>',
							'</div>',
						'</fieldset>'].join(''),
			// converts the template to the final state
			link: function (scope, aInput, attributes) {
				/* jshint maxstatements: 20 */

				var eFieldset = aInput.children().eq(0);
				var children = eFieldset.children();
				var eLegend = children.eq(0);
				var eCheckboxGroup = children.eq(1);
				var eCheckbox = eCheckboxGroup.children().eq(0);
				children = eCheckbox.children();
				var eInput = children.eq(0);
				var eLabel =  children.eq(1);

				// iterate over all the attributes of the a-checkboxgroup
				// and assign them to the appropriate part of the template
				for (var name in attributes.$attr) {
					if (attributes.$attr.hasOwnProperty(name)) {
						switch (name) {
						case 'id':
							eInput.attr('id', attributes.id);
							eLabel.attr('for', attributes.id); break;
						case 'legend':
							eLegend.text(attributes.legend); break;
						case 'label':
							eLabel.text('{{' + attributes.label + '}}'); break;
						case 'repeat':
							eCheckbox.attr('ng-repeat', attributes.repeat); break;
						case 'modelArray':
							eInput.attr('checklist-model', attributes.modelArray); break;
						case 'modelValue':
							eInput.attr('checklist-value', attributes.modelValue); break;
						case 'classFieldset':
							eFieldset.addClass(attributes.classFieldset); break;
						case 'classLegend':
							eLegend.addClass(attributes.classLegend); break;
						case 'classCheckboxGroup':
							eCheckboxGroup.addClass(attributes.classCheckboxGroup); break;
						case 'classCheckbox':
							eCheckbox.addClass(attributes.classCheckbox); break;
						case 'classLabel':
							eLabel.addClass(attributes.classLabel); break;
						case 'class':
							eInput.addClass(attributes.class); break;
						default:
							// by default move the attribute to the input
							eInput.attr(attributes.$attr[name], attributes[name]); break;
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
			template: ['<fieldset class="aa-fieldset">',
							'<div class="sr-only"></div>',
							'<div class="aa-error"></div>',
							'<label class="aa-label"></label>',
							'<div class="aa-inputwrap">',
								'<input class="aa-input" blur-focus></input>',
							'</div>',
						'</fieldset>'].join(''),
			// converts the template to the final state
			link: function (scope, aInput, attributes) {
				/* jshint maxstatements: 21 */

				var eFieldset = aInput.children().eq(0);
				var children = eFieldset.children();
				var eHelp = children.eq(0);
				var eError = children.eq(1);
				var eLabel = children.eq(2);
				var eInputWrapper = children.eq(3);
				var eInput = eInputWrapper.children().eq(0);

				// iterate over all the attributes of the a-input
				// and assign them to the appropriate part of the template
				for (var name in attributes.$attr) {
					if (attributes.$attr.hasOwnProperty(name)) {
						switch (name) {
						case 'id':
							var id = attributes.id + '-input';
							eHelp.attr('id', id + '-help');
							eError.attr('id', id + '-error');
							eInput.attr('id', id);
							eLabel.attr('for', id); break;
						case 'help':
							eHelp.text(attributes.help); break;
						case 'error':
							eError.text(attributes.error); break;
						case 'label':
							eLabel.text(attributes.label);break;
						case 'required':
							eInput.attr('required', 'true');
							eInput.attr('aria-required', 'true'); break;
						case 'classInputwrap':
							eInputWrapper.addClass(attributes.classInputwrap); break;
						case 'classLabel':
							eLabel.addClass(attributes.classLabel); break;
						case 'classError':
							eError.addClass(attributes.classError); break;
						case 'classFieldset':
							eFieldset.addClass(attributes.classFieldset); break;
						case 'class':
							eInput.addClass(attributes.class); break;
						default:
							// by default move the attribute to the input
							eInput.attr(attributes.$attr[name], attributes[name]);
						}
					}
				}

				// find the accessible form name
				var formName = aInput.closest('form').attr('name');
				var inputName = formName + '.' + eInput.attr('name');
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
			template: ['<fieldset class="aa-fieldset">',
							'<div class="sr-only"></div>',
							'<div class="aa-error"></div>',
							'<label class="aa-label"></label>',
							'<div class="aa-inputwrap">',
								'<select blur-focus class="aa-select"></input>',
							'</div>',
						'</fieldset>'].join(''),
			link: function (scope, aSelect, attributes) {
				/* jshint maxstatements: 20 */

				// the fieldset - should be the only child
				var eFieldset = aSelect.children().eq(0);
				// the help, error and label
				var children = eFieldset.children();
				var eHelp = children.eq(0);
				var eError = children.eq(1);
				var eLabel = children.eq(2);
				var eSelectwrap = children.eq(3);
				var eSelect = eSelectwrap.children().eq(0);

				// iterate over all the attributes of the a-input
				// and assign them to the appropriate part of the template
				for (var name in attributes.$attr) {
					if (attributes.$attr.hasOwnProperty(name)) {
						switch (name) {
						case 'id':
							var id = attributes.id + '-input';
							eHelp.attr('id', id + '-help');
							eError.attr('id', id + '-error');
							eSelect.attr('id', id);
							eLabel.attr('for', id); break;
						case 'help':
							eHelp.text(attributes.help); break;
						case 'error':
							eError.text(attributes.error); break;
						case 'label':
							eLabel.text(attributes.label); break;
						case 'required':
							eSelect.attr('required', 'true');
							eSelect.attr('aria-required', 'true'); break;
						case 'classFieldset':
							eFieldset.addClass(attributes.classFieldset); break;
						case 'classError':
							eError.addClass(attributes.classError); break;
						case 'classSelectwrap':
							eSelectwrap.addClass(attributes.classSelectwrap); break;
						case 'classLabel':
							eLabel.addClass(attributes.classLabel); break;
						case 'class':
							eSelect.addClass(attributes.class); break;
						default:
							// by default move the attribute to the input
							eSelect.attr(attributes.$attr[name], attributes[name]);
						}
					}
				}

				// find the accessible form name
				var formName = aSelect.closest('form').attr('name');
				var inputName = formName + '.' + eSelect.attr('name');
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

				if (!ctrl) {
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
