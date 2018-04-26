'use strict';

/**
 * Function used to define form steps navigation behavior
 * @param  {object} e [javascript event object]
 * @return {[type]}   [description]
 */
function stepper(e) {
  var $steps = jQuery('.form-step');
  $steps.each(function () {
    jQuery(this).removeClass('bg-highlight');
    jQuery(this).removeClass('text-white');
    jQuery(this).addClass('text-highlight');
    jQuery(this).addClass('bg-light-gray');
  });

  if (e.target.type.toLowerCase() === "checkbox") {
    var target = jQuery(e.target).parent().parent().parent().parent().prev();
  } else {
    var target = jQuery(e.target).parent().parent().prev();
  }

  $activeStep = target.find(".form-step");
  $activeStep.addClass("bg-highlight");
  $activeStep.addClass("text-white");
  $activeStep.removeClass("text-highlight");
  $activeStep.removeClass("bg-light-gray");
}

/**
 * Function used to toggle between sections
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function navbarToggle(e) {
  var $target = jQuery(e.target);
  if ($target.prop("tagName").toLowerCase() === "li") {
    $target.siblings().removeClass('active');
    $target.addClass('active');
    var sectionID = $target.attr('data-section');
    var $dataSections = jQuery('.data-nav-section');
    jQuery.each($dataSections, function () {
      jQuery(this).hide();
    });
    jQuery('#' + sectionID).show();
  }
}

/**
 * Function used to show a specific navbar tab
 * @param  {string} section [CSS selector for section to show]
 */
function showNavbarSection(section) {
  jQuery(section).show();
}
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Sticky Plugin v1.0.4 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 02/14/2011
// Date: 07/20/2015
// Website: http://stickyjs.com/
// Description: Makes an element on the page stick on the screen as you scroll
//              It will only set the 'top' and 'position' of your element, you
//              might need to adjust the width in some cases.

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  var slice = Array.prototype.slice; // save ref to original slice()
  var splice = Array.prototype.splice; // save ref to original slice()

  var defaults = {
    topSpacing: 0,
    bottomSpacing: 0,
    className: 'is-sticky',
    wrapperClassName: 'sticky-wrapper',
    center: false,
    getWidthFrom: '',
    widthFromWrapper: true, // works only when .getWidthFrom is empty
    responsiveWidth: false,
    zIndex: 'inherit'
  },
      $window = $(window),
      $document = $(document),
      sticked = [],
      windowHeight = $window.height(),
      scroller = function scroller() {
    var scrollTop = $window.scrollTop(),
        documentHeight = $document.height(),
        dwh = documentHeight - windowHeight,
        extra = scrollTop > dwh ? dwh - scrollTop : 0;

    for (var i = 0, l = sticked.length; i < l; i++) {
      var s = sticked[i],
          elementTop = s.stickyWrapper.offset().top,
          etse = elementTop - s.topSpacing - extra;

      //update height in case of dynamic content
      s.stickyWrapper.css('height', s.stickyElement.outerHeight());

      if (scrollTop <= etse) {
        if (s.currentTop !== null) {
          s.stickyElement.css({
            'width': '',
            'position': '',
            'top': '',
            'z-index': ''
          });
          s.stickyElement.parent().removeClass(s.className);
          s.stickyElement.trigger('sticky-end', [s]);
          s.currentTop = null;
        }
      } else {
        var newTop = documentHeight - s.stickyElement.outerHeight() - s.topSpacing - s.bottomSpacing - scrollTop - extra;
        if (newTop < 0) {
          newTop = newTop + s.topSpacing;
        } else {
          newTop = s.topSpacing;
        }
        if (s.currentTop !== newTop) {
          var newWidth;
          if (s.getWidthFrom) {
            padding = s.stickyElement.innerWidth() - s.stickyElement.width();
            newWidth = $(s.getWidthFrom).width() - padding || null;
          } else if (s.widthFromWrapper) {
            newWidth = s.stickyWrapper.width();
          }
          if (newWidth == null) {
            newWidth = s.stickyElement.width();
          }
          s.stickyElement.css('width', newWidth).css('position', 'fixed').css('top', newTop).css('z-index', s.zIndex);

          s.stickyElement.parent().addClass(s.className);

          if (s.currentTop === null) {
            s.stickyElement.trigger('sticky-start', [s]);
          } else {
            // sticky is started but it have to be repositioned
            s.stickyElement.trigger('sticky-update', [s]);
          }

          if (s.currentTop === s.topSpacing && s.currentTop > newTop || s.currentTop === null && newTop < s.topSpacing) {
            // just reached bottom || just started to stick but bottom is already reached
            s.stickyElement.trigger('sticky-bottom-reached', [s]);
          } else if (s.currentTop !== null && newTop === s.topSpacing && s.currentTop < newTop) {
            // sticky is started && sticked at topSpacing && overflowing from top just finished
            s.stickyElement.trigger('sticky-bottom-unreached', [s]);
          }

          s.currentTop = newTop;
        }

        // Check if sticky has reached end of container and stop sticking
        var stickyWrapperContainer = s.stickyWrapper.parent();
        var unstick = s.stickyElement.offset().top + s.stickyElement.outerHeight() >= stickyWrapperContainer.offset().top + stickyWrapperContainer.outerHeight() && s.stickyElement.offset().top <= s.topSpacing;

        if (unstick) {
          s.stickyElement.css('position', 'absolute').css('top', '').css('bottom', 0).css('z-index', '');
        } else {
          s.stickyElement.css('position', 'fixed').css('top', newTop).css('bottom', '').css('z-index', s.zIndex);
        }
      }
    }
  },
      resizer = function resizer() {
    windowHeight = $window.height();

    for (var i = 0, l = sticked.length; i < l; i++) {
      var s = sticked[i];
      var newWidth = null;
      if (s.getWidthFrom) {
        if (s.responsiveWidth) {
          newWidth = $(s.getWidthFrom).width();
        }
      } else if (s.widthFromWrapper) {
        newWidth = s.stickyWrapper.width();
      }
      if (newWidth != null) {
        s.stickyElement.css('width', newWidth);
      }
    }
  },
      methods = {
    init: function init(options) {
      return this.each(function () {
        var o = $.extend({}, defaults, options);
        var stickyElement = $(this);

        var stickyId = stickyElement.attr('id');
        var wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName;
        var wrapper = $('<div></div>').attr('id', wrapperId).addClass(o.wrapperClassName);

        stickyElement.wrapAll(function () {
          if ($(this).parent("#" + wrapperId).length == 0) {
            return wrapper;
          }
        });

        var stickyWrapper = stickyElement.parent();

        if (o.center) {
          stickyWrapper.css({ width: stickyElement.outerWidth(), marginLeft: "auto", marginRight: "auto" });
        }

        if (stickyElement.css("float") === "right") {
          stickyElement.css({ "float": "none" }).parent().css({ "float": "right" });
        }

        o.stickyElement = stickyElement;
        o.stickyWrapper = stickyWrapper;
        o.currentTop = null;

        sticked.push(o);

        methods.setWrapperHeight(this);
        methods.setupChangeListeners(this);
      });
    },

    setWrapperHeight: function setWrapperHeight(stickyElement) {
      var element = $(stickyElement);
      var stickyWrapper = element.parent();
      if (stickyWrapper) {
        stickyWrapper.css('height', element.outerHeight());
      }
    },

    setupChangeListeners: function setupChangeListeners(stickyElement) {
      if (window.MutationObserver) {
        var mutationObserver = new window.MutationObserver(function (mutations) {
          if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
            methods.setWrapperHeight(stickyElement);
          }
        });
        mutationObserver.observe(stickyElement, { subtree: true, childList: true });
      } else {
        if (window.addEventListener) {
          stickyElement.addEventListener('DOMNodeInserted', function () {
            methods.setWrapperHeight(stickyElement);
          }, false);
          stickyElement.addEventListener('DOMNodeRemoved', function () {
            methods.setWrapperHeight(stickyElement);
          }, false);
        } else if (window.attachEvent) {
          stickyElement.attachEvent('onDOMNodeInserted', function () {
            methods.setWrapperHeight(stickyElement);
          });
          stickyElement.attachEvent('onDOMNodeRemoved', function () {
            methods.setWrapperHeight(stickyElement);
          });
        }
      }
    },
    update: scroller,
    unstick: function unstick(options) {
      return this.each(function () {
        var that = this;
        var unstickyElement = $(that);

        var removeIdx = -1;
        var i = sticked.length;
        while (i-- > 0) {
          if (sticked[i].stickyElement.get(0) === that) {
            splice.call(sticked, i, 1);
            removeIdx = i;
          }
        }
        if (removeIdx !== -1) {
          unstickyElement.unwrap();
          unstickyElement.css({
            'width': '',
            'position': '',
            'top': '',
            'float': '',
            'z-index': ''
          });
        }
      });
    }
  };

  // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
  if (window.addEventListener) {
    window.addEventListener('scroll', scroller, false);
    window.addEventListener('resize', resizer, false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', scroller);
    window.attachEvent('onresize', resizer);
  }

  $.fn.sticky = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };

  $.fn.unstick = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
      return methods.unstick.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };
  $(function () {
    setTimeout(scroller, 0);
  });
});
"use strict";

/**
 * Create a base constructor function to create a basic form element
 * @param  {options} options [Form element configuration options]
 */
var formElement = function formElement(options) {
	this.container = document.querySelector(options.container);
	this.error = false;
	this.onChange = options.onChange;
	this.onBlur = options.onBlur;
	this.onKeyup = options.onKeyup;
	this.onFocus = options.onFocus;
	this.placeholder = options.placeholder;
	this.validation = {
		enabled: options.validation.enabled || false,
		message: options.validation.message || "Please enter a valid value",
		value: options.validation.value || "blank",
		events: options.validation.events || ["keyup", "blur", "change"]
	};
	this.bindEvents();
	this.init();
};

/**
 * This function is used to initialize the form element
 * @return {object} [returns the formElement object]
 */
formElement.prototype.init = function () {
	if (typeof this.placeholder !== "undefined") {
		this.setPlaceholder(this.placeholder);
	}
	return this;
};

/**
 * This function is used to set the data
 * @param {array} data [array to set as data]
 */
formElement.prototype.setData = function (data) {
	this.data = data;
	return this;
};

/**
 * Function used to add class to form element
 * @param {string} cssClass [CSS class to add]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.addClass = function (cssClass) {
	if (this.container.classList.contains(cssClass)) {
		this.container.classList.remove(cssClass);
		this.container.classList.add(cssClass);
	} else {
		this.container.classList.add(cssClass);
	}
	return this;
};

/**
 * Function used to remove class from form element
 * @param {string} cssClass [CSS class to remove]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.removeClass = function (cssClass) {
	if (this.container.classList.contains(cssClass)) {
		this.container.classList.remove(cssClass);
	}
	return this;
};

/**
 * Function used to get/set form element disabled state
 * @param  {boolean} state [boolean used to set disabled state]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.disabled = function (state) {
	if (typeof state === "undefined") {
		var disabled = this.container.getAttribute("disabled");
		if (disabled === null) {
			return false;
		} else {
			return true;
		}
	} else {
		this.container.removeAttribute("readonly");
		if (state === true) {
			this.container.setAttribute("disabled", "disabled");
		} else {
			this.container.removeAttribute("disabled");
		}
	}
	return this;
};

/**
 * Function used to get/set form element readonly state
 * @param  {boolean} state [boolean used to set readonly state]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.readonly = function (state) {
	if (typeof state === "undefined") {
		var readonly = this.container.getAttribute("readonly");
		if (readonly === null) {
			return false;
		} else {
			return true;
		}
	} else {
		this.container.removeAttribute("disabled");
		if (state === true) {
			this.container.setAttribute("readonly", "readonly");
		} else {
			this.container.removeAttribute("readonly");
		}
	}
	return this;
};

/**
 * This function is used to set the placeholder text on a form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.setPlaceholder = function (placeholder) {
	this.container.setAttribute("placeholder", placeholder);
	this.placeholder = placeholder;
	return this;
};

/**
 * This function is used to show the form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.show = function () {
	this.container.style.display = "";
	return this;
};

/**
 * This function is used to hide the form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.hide = function () {
	this.container.style.display = "none";
	return this;
};

/**
 * This function is used to validate the form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.validate = function () {
	if (this.validation.enabled) {
		var valid = checkValid(this.container, this.validation.value, this.validation.message);
		if (!valid) {
			this.error = true;
		} else {
			this.error = false;
		}
	}
	return this;
};

/**
 * This function is used to remove an error message from an input
 * @return {object} [returns formElement object]
 */
formElement.prototype.removeErrorMessage = function () {
	removeErrorMessage(this.container);
	return this;
};

/**
 * Function used to bind events to form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.bindEvents = function () {
	this.container.addEventListener("change", this.onChange);
	this.container.addEventListener("blur", this.onBlur);
	this.container.addEventListener("keyup", this.onKeyup);
	this.container.addEventListener("focus", this.onFocus);

	if (this.validation.enabled) {
		var self = this;
		this.validation.events.forEach(function (v) {
			self.container.addEventListener(v, function () {
				var valid = checkValid(self.container, self.validation.value, self.validation.message);
				if (!valid) {
					self.error = true;
				} else {
					self.error = false;
				}
			});
		});
	}
	return this;
};

var Checkbox = function Checkbox(options) {
	formElement.call(this, options);
	this.checked = options.checked || [];
	this.data = [];
	this.valueIndex = options.valueIndex || 0;
	this.displayIndex = options.displayIndex || 1;
};
Checkbox.prototype = Object.create(formElement.prototype);

Checkbox.prototype.clearSelected = function () {
	var $checkboxes = this.container.querySelectorAll(' input[type="checkbox"]');
	$checkboxes.forEach(function (v, k) {
		v.checked = false;
	});
	return this;
};

Checkbox.prototype.setChecked = function () {
	this.checked = data;
	this.setCheckedStyle();
	return this;
};

Checkbox.prototype.buildCheckbox = function () {
	if (typeof this.data !== "undefined") {
		var self = this;
		keys = Object.keys(this.data[0]);
		this.container.innerHTML = "";
		this.data.forEach(function (v, k) {
			var div = document.createElement("div");
			div.classList += 'checkbox-container checkbox-container-' + k;

			var input = document.createElement("input");
			input.type = "checkbox";
			input.id = "checkbox-" + k;
			input.value = v[keys[self.valueIndex]];
			input.classList += "js-checkbox";

			var span = document.createElement("span");
			span.textContent = v[keys[self.displayIndex]];

			div.appendChild(input);
			div.appendChild(span);
			self.container.appendChild(div);
		});
		this.setCheckedStyle();
		return this;
	}
};

Checkbox.prototype.setCheckedStyle = function () {
	var self = this;
	var $checkboxContainers = document.querySelectorAll(".checkbox-container");
	var $checkboxSpans = document.querySelectorAll(".checkbox-container span");
	$checkboxContainers.forEach(function (v, k) {
		v.classList.remove("active-checkbox-container");
	});

	$checkboxSpans.forEach(function (v, k) {
		v.classList.remove("active-checkbox");
	});

	this.checked.forEach(function (v, k) {
		var $check = self.container.querySelector(' input#checkbox-' + k);
		$check.checked = true;

		var $checkboxContainer = self.container.querySelector(' .checkbox-container-' + k).classList.add('active-checkbox-container');

		var $label = self.container.querySelector(' .checkbox-container-' + k + ' span').classList.add("active-checkbox");
	});
	return this;
};

Checkbox.prototype.getIndex = function () {
	var $checkboxes = this.container.querySelectorAll('input[type="checkbox"]');
	var selected = [];

	$checkboxes.forEach(function (v, k) {
		if (v.checked) {
			selected.push(k);
		}
	});
	return selected;
};

Checkbox.prototype.getValue = function () {
	return this.container.value;
};

Checkbox.prototype.isChecked = function () {
	if (this.container.checked) {
		return true;
	} else {
		return false;
	}
};

var datePicker = function datePicker(options) {
	formElement.call(this, options);
};
datePicker.prototype = Object.create(formElement.prototype);

/**
 * Function used to set the date for a date input
 * If no arguments provided date is set to today
 * If just a date is provided, the date is set to the provided date
 * If a date and a number of days is specified, the date is set to the number of days from the date provided
 * @param {string} date [date in format 'YYYY-MM-DD']
 * @param {number} days [number of days from current or provided date]
 * @return {object} [returns datePicker object]
 */
datePicker.prototype.setDate = function (date, days) {
	var properDate = new Date();
	var newDateFormatted = properDate.getFullYear() + '-' + ("0" + (properDate.getMonth() + 1)).slice(-2) + '-' + ("0" + properDate.getDate()).slice(-2);

	if (typeof date == "undefined" && typeof days === "undefined") {
		this.container.value = newDateFormatted;
		return this;
	} else if (typeof date == "number" && typeof days === "undefined") {
		var days = date;
		var newDate = new Date(properDate.setDate(properDate.getDate() - days));
		newDateFormatted = newDate.getFullYear() + '-' + ("0" + (newDate.getMonth() + 1)).slice(-2) + '-' + ("0" + newDate.getDate()).slice(-2);
		this.container.value = newDateFormatted;
		return this;
	} else if (typeof date == "string" && typeof days !== "undefined") {
		properDate = new Date(date);
		var newDate = new Date(properDate.setDate(properDate.getDate() - days));
		newDateFormatted = newDate.getFullYear() + '-' + ("0" + (newDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (newDate.getDate() + 1)).slice(-2);
		this.container.value = newDateFormatted;
		return this;
	} else {
		this.container.value = date;
		return this;
	}
};

/**
 * Function used to get date of date input
 * @return {object} [returns datePicker object]
 */
datePicker.prototype.getDate = function () {
	return this.container.value;
};

/**
 * Function used to add X days to date input
 * @param {number} days [number of days top add to input]
 * @return {object} [returns datePicker object]
 */
datePicker.prototype.addDaysToDate = function (days) {
	var date = this.container.value;
	var newDate = new Date(date);
	var momentDate = moment(newDate).add(2, 'd');
	var formattedDate = momentDate.format('YYYY-MM-DD');
	this.container.value = formattedDate;
	return this;
};

/**
 * Function used to format the date as "MM/DD/YYYY"
 * @param  {date} date [date to format]
 * @return {string}      [formatted date in "MM/DD/YYYY" format]
 */
datePicker.prototype.formatDate = function (date) {
	var properDate = new Date(date);
	var formattedDate = properDate.getMonth() + 1 + '/' + (properDate.getDate() + 1) + '/' + properDate.getFullYear();
	return formattedDate;
};

var Dropdown = function Dropdown(options) {
	formElement.call(this, options);
	this.valueIndex = options.valueIndex || 0;
	this.textIndex = options.textIndex || 1;
	this.selectedValue = options.selectedValue;
};
Dropdown.prototype = Object.create(formElement.prototype);

/**
 * This function is used to clear the dropdown of all options
 * @return {object} [Dropdown object]
 */
Dropdown.prototype.clearDropdown = function () {
	this.container.innerHTML = "";
	return this;
};

/**
 * This function is used to build the options for a Dropdown
 * @return {object} [Dropdown object]
 */
Dropdown.prototype.buildDropdown = function () {
	var keys,
	    valueKey,
	    textKey,
	    response,
	    self = this;

	if (this.data != null) {
		response = this.data;
		this.addClass("js-dropdown");
		keys = Object.keys(response[0]);
		valueKey = keys[this.valueIndex];
		textKey = keys[this.textIndex];
		response.forEach(function (d) {
			var option = document.createElement('option');
			option.value = d[valueKey];
			option.textContent = d[textKey];
			self.container.appendChild(option);
		});

		if (typeof this.selectedValue !== "undefined") {
			this.container.value = this.selectedValue;
			this.value = this.selectedValue;
		} else {
			this.container.value = -1;
			this.value = -1;
		}
		return self;
	}
};

/**
 * This function is used to get/set the Dropdown value
 * @param  {number/string} value [Value to set the Dropdown too]
 * @return {object/number/string} [Dropdown object/currently selected option value]
 */
Dropdown.prototype.val = function (value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		if (value == null) {
			this.container.value = -1;
			this.value = -1;
		} else {
			this.container.value = value;
			this.value = value;
		}
		return this;
	}
};

/**
 * Function used to return the text for the currently selected dropdown option
 * @return {string} [text for selected option]
 */
Dropdown.prototype.text = function () {
	var selected = this.container.options;
	return selected[selected.selectedIndex].text;
};

var dropdownMulti = function dropdownMulti(options) {
	formElement.call(this, options);
	this.valueIndex = options.valueIndex || 0;
	this.textIndex = options.textIndex || 1;
	this.selectedValue = options.selectedValue;
};
dropdownMulti.prototype = Object.create(formElement.prototype);

/**
 * This function is used to clear the dropdown of all options
 * @return {object} [Dropdown object]
 */
dropdownMulti.prototype.clearDropdown = function () {
	this.container.innerHTML = "";
	return this;
};

/**
 * This function is used to build the options for a Dropdown
 * @return {object} [Dropdown object]
 */
dropdownMulti.prototype.buildDropdown = function () {
	var keys,
	    valueKey,
	    textKey,
	    response,
	    self = this;

	if (this.data != null) {
		response = this.data;
		this.addClass("js-dropdown");
		keys = Object.keys(response[0]);
		valueKey = keys[this.valueIndex];
		textKey = keys[this.textIndex];
		response.forEach(function (d) {
			var option = document.createElement('option');
			option.value = d[valueKey];
			option.textContent = d[textKey];
			self.container.appendChild(option);
		});

		if (typeof this.selectedValue !== "undefined") {
			this.container.value = this.selectedValue;
			this.value = this.selectedValue;
		} else {
			this.container.value = -1;
			this.value = -1;
		}
		return self;
	}
};

dropdownMulti.prototype.val = function (value) {
	if (typeof value === "undefined") {
		var values = [];
		var options = this.container.options;

		for (var i = 0; i < options.length; i++) {
			if (options[i].selected) {
				values.push(options[i].value);
			}
		}
		return values;
	} else {
		if (value == null) {
			this.container.value = -1;
			this.value = -1;
		} else {
			this.container.value = value;
			this.value = value;
		}
		return this;
	}
};

/**
 * Function used to return the text for the currently selected dropdown option
 * @return {string} [text for selected option]
 */
dropdownMulti.prototype.text = function () {
	var selected = this.container.options;
	return selected[selected.selectedIndex].text;
};

var numberInput = function numberInput(options) {
	formElement.call(this, options);
};
numberInput.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
numberInput.prototype.val = function (value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;
		return this;
	}
};

var textInput = function textInput(options) {
	formElement.call(this, options);
};
textInput.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
textInput.prototype.val = function (value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;
		return this;
	}
};

var textArea = function textArea(options) {
	formElement.call(this, options);
};
textArea.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
textArea.prototype.val = function (value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;
		return this;
	}
};

var timePicker = function timePicker(options) {
	formElement.call(this, options);
};
timePicker.prototype = Object.create(formElement.prototype);

/**
 * This Method is used to set the time for a time input
 * @param {string} time [time in format "HH:MM"]
 * @return {object}      [timePicker object]
 */
timePicker.prototype.setTime = function (time) {
	var properDate = new Date();
	this.container.value = time;
	return this;
};

/**
 * This Method is used to return the entered time for the time input
 * @return {object}      [timePicker object]
 */
timePicker.prototype.getTime = function () {
	return this.container.value;
};

var mercurySlider = function mercurySlider(options) {
	formElement.call(this, options);
};
mercurySlider.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
mercurySlider.prototype.val = function (value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;
		return this;
	}
};

// pattern found at https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
var emailRegEx = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

/**
 * Function used to add a CSS class to an element
 * Checks if element already has that class
 * @param {object} element   [HTML element to add the class to]
 * @param {string} className [classname to add to the element]
 */
function addClass(element, className) {
	if (!element.classList.contains(className)) {
		element.classList.add(className);
	}
}

/**
 * Function used to determine if a form element has a valdi value
 * @param  {object} target  [HTML element that is being validated]
 * @param  {string} type    [Validation type that is being performed]
 * @param  {string} message [Error message to display]
 */
function checkValid(target, type, message) {
	var val = target.value,
	    type = type.toLowerCase(),
	    valid;

	if (type === 'blank') {
		if (val === "") {
			displayFormError(target, false, message);
			valid = false;
		} else {
			displayFormError(target, true);
			valid = true;
		}
	} else if (type === "email") {
		if (!emailRegEx.test(val) || val === "") {
			displayFormError(target, false, message);
			valid = false;
		} else {
			displayFormError(target, true);
			valid = true;
		}
	} else if (type === "dropdown") {
		if (val === "-1") {
			displayFormError(target, false, message);
			valid = false;
		} else {
			displayFormError(target, true);
			valid = true;
		}
	}
	return valid;
}

/**
 * Function used to remove an error message
 * @param  {object} target [the HTML element to remove the error message from]
 */
function removeErrorMessage(target) {
	var sibling = target.previousElementSibling;

	if (sibling !== null) {
		if (sibling.classList.contains('error-message')) {
			sibling.remove();
		}
	}
}

/**
 * Function used to display and remove form errors
 * @param  {object} target  [The HTML element to display/remove the message for]
 * @param  {boolean} valid   [boolean indicating form state]
 * @param  {string} message [Error message to display]
 */
function displayFormError(target, valid, message) {
	var tagName = target.tagName.toLowerCase();
	if (!valid && tagName === "input") {
		target.classList.add("error");
	} else if (tagName === "input") {
		target.classList.remove("error");
	}

	if (!valid) {
		removeErrorMessage(target);
		var error = document.createElement("span");
		error.textContent = message;
		addClass(error, 'error-message');
		target.insertAdjacentElement('beforeBegin', error);
	} else {
		removeErrorMessage(target);
	}
}

function displayFormSubmitError(target, message) {
	var target = document.querySelector(target);
	target.textContent = message;
	target.style.display = "";
}
"use strict";

/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript */
var _self = "undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : {},
    Prism = function () {
  var e = /\blang(?:uage)?-(\w+)\b/i,
      t = 0,
      n = _self.Prism = { manual: _self.Prism && _self.Prism.manual, disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler, util: { encode: function encode(e) {
        return e instanceof a ? new a(e.type, n.util.encode(e.content), e.alias) : "Array" === n.util.type(e) ? e.map(n.util.encode) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
      }, type: function type(e) {
        return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1];
      }, objId: function objId(e) {
        return e.__id || Object.defineProperty(e, "__id", { value: ++t }), e.__id;
      }, clone: function clone(e) {
        var t = n.util.type(e);switch (t) {case "Object":
            var a = {};for (var r in e) {
              e.hasOwnProperty(r) && (a[r] = n.util.clone(e[r]));
            }return a;case "Array":
            return e.map(function (e) {
              return n.util.clone(e);
            });}return e;
      } }, languages: { extend: function extend(e, t) {
        var a = n.util.clone(n.languages[e]);for (var r in t) {
          a[r] = t[r];
        }return a;
      }, insertBefore: function insertBefore(e, t, a, r) {
        r = r || n.languages;var l = r[e];if (2 == arguments.length) {
          a = arguments[1];for (var i in a) {
            a.hasOwnProperty(i) && (l[i] = a[i]);
          }return l;
        }var o = {};for (var s in l) {
          if (l.hasOwnProperty(s)) {
            if (s == t) for (var i in a) {
              a.hasOwnProperty(i) && (o[i] = a[i]);
            }o[s] = l[s];
          }
        }return n.languages.DFS(n.languages, function (t, n) {
          n === r[e] && t != e && (this[t] = o);
        }), r[e] = o;
      }, DFS: function DFS(e, t, a, r) {
        r = r || {};for (var l in e) {
          e.hasOwnProperty(l) && (t.call(e, l, e[l], a || l), "Object" !== n.util.type(e[l]) || r[n.util.objId(e[l])] ? "Array" !== n.util.type(e[l]) || r[n.util.objId(e[l])] || (r[n.util.objId(e[l])] = !0, n.languages.DFS(e[l], t, l, r)) : (r[n.util.objId(e[l])] = !0, n.languages.DFS(e[l], t, null, r)));
        }
      } }, plugins: {}, highlightAll: function highlightAll(e, t) {
      var a = { callback: t, selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code' };n.hooks.run("before-highlightall", a);for (var r, l = a.elements || document.querySelectorAll(a.selector), i = 0; r = l[i++];) {
        n.highlightElement(r, e === !0, a.callback);
      }
    }, highlightElement: function highlightElement(t, a, r) {
      for (var l, i, o = t; o && !e.test(o.className);) {
        o = o.parentNode;
      }o && (l = (o.className.match(e) || [, ""])[1].toLowerCase(), i = n.languages[l]), t.className = t.className.replace(e, "").replace(/\s+/g, " ") + " language-" + l, t.parentNode && (o = t.parentNode, /pre/i.test(o.nodeName) && (o.className = o.className.replace(e, "").replace(/\s+/g, " ") + " language-" + l));var s = t.textContent,
          g = { element: t, language: l, grammar: i, code: s };if (n.hooks.run("before-sanity-check", g), !g.code || !g.grammar) return g.code && (n.hooks.run("before-highlight", g), g.element.textContent = g.code, n.hooks.run("after-highlight", g)), n.hooks.run("complete", g), void 0;if (n.hooks.run("before-highlight", g), a && _self.Worker) {
        var u = new Worker(n.filename);u.onmessage = function (e) {
          g.highlightedCode = e.data, n.hooks.run("before-insert", g), g.element.innerHTML = g.highlightedCode, r && r.call(g.element), n.hooks.run("after-highlight", g), n.hooks.run("complete", g);
        }, u.postMessage(JSON.stringify({ language: g.language, code: g.code, immediateClose: !0 }));
      } else g.highlightedCode = n.highlight(g.code, g.grammar, g.language), n.hooks.run("before-insert", g), g.element.innerHTML = g.highlightedCode, r && r.call(t), n.hooks.run("after-highlight", g), n.hooks.run("complete", g);
    }, highlight: function highlight(e, t, r) {
      var l = n.tokenize(e, t);return a.stringify(n.util.encode(l), r);
    }, matchGrammar: function matchGrammar(e, t, a, r, l, i, o) {
      var s = n.Token;for (var g in a) {
        if (a.hasOwnProperty(g) && a[g]) {
          if (g == o) return;var u = a[g];u = "Array" === n.util.type(u) ? u : [u];for (var c = 0; c < u.length; ++c) {
            var h = u[c],
                f = h.inside,
                d = !!h.lookbehind,
                m = !!h.greedy,
                p = 0,
                y = h.alias;if (m && !h.pattern.global) {
              var v = h.pattern.toString().match(/[imuy]*$/)[0];h.pattern = RegExp(h.pattern.source, v + "g");
            }h = h.pattern || h;for (var b = r, k = l; b < t.length; k += t[b].length, ++b) {
              var w = t[b];if (t.length > e.length) return;if (!(w instanceof s)) {
                h.lastIndex = 0;var _ = h.exec(w),
                    P = 1;if (!_ && m && b != t.length - 1) {
                  if (h.lastIndex = k, _ = h.exec(e), !_) break;for (var A = _.index + (d ? _[1].length : 0), j = _.index + _[0].length, x = b, O = k, N = t.length; N > x && (j > O || !t[x].type && !t[x - 1].greedy); ++x) {
                    O += t[x].length, A >= O && (++b, k = O);
                  }if (t[b] instanceof s || t[x - 1].greedy) continue;P = x - b, w = e.slice(k, O), _.index -= k;
                }if (_) {
                  d && (p = _[1].length);var A = _.index + p,
                      _ = _[0].slice(p),
                      j = A + _.length,
                      S = w.slice(0, A),
                      C = w.slice(j),
                      M = [b, P];S && (++b, k += S.length, M.push(S));var E = new s(g, f ? n.tokenize(_, f) : _, y, _, m);if (M.push(E), C && M.push(C), Array.prototype.splice.apply(t, M), 1 != P && n.matchGrammar(e, t, a, b, k, !0, g), i) break;
                } else if (i) break;
              }
            }
          }
        }
      }
    }, tokenize: function tokenize(e, t) {
      var a = [e],
          r = t.rest;if (r) {
        for (var l in r) {
          t[l] = r[l];
        }delete t.rest;
      }return n.matchGrammar(e, a, t, 0, 0, !1), a;
    }, hooks: { all: {}, add: function add(e, t) {
        var a = n.hooks.all;a[e] = a[e] || [], a[e].push(t);
      }, run: function run(e, t) {
        var a = n.hooks.all[e];if (a && a.length) for (var r, l = 0; r = a[l++];) {
          r(t);
        }
      } } },
      a = n.Token = function (e, t, n, a, r) {
    this.type = e, this.content = t, this.alias = n, this.length = 0 | (a || "").length, this.greedy = !!r;
  };if (a.stringify = function (e, t, r) {
    if ("string" == typeof e) return e;if ("Array" === n.util.type(e)) return e.map(function (n) {
      return a.stringify(n, t, e);
    }).join("");var l = { type: e.type, content: a.stringify(e.content, t, r), tag: "span", classes: ["token", e.type], attributes: {}, language: t, parent: r };if (e.alias) {
      var i = "Array" === n.util.type(e.alias) ? e.alias : [e.alias];Array.prototype.push.apply(l.classes, i);
    }n.hooks.run("wrap", l);var o = Object.keys(l.attributes).map(function (e) {
      return e + '="' + (l.attributes[e] || "").replace(/"/g, "&quot;") + '"';
    }).join(" ");return "<" + l.tag + ' class="' + l.classes.join(" ") + '"' + (o ? " " + o : "") + ">" + l.content + "</" + l.tag + ">";
  }, !_self.document) return _self.addEventListener ? (n.disableWorkerMessageHandler || _self.addEventListener("message", function (e) {
    var t = JSON.parse(e.data),
        a = t.language,
        r = t.code,
        l = t.immediateClose;_self.postMessage(n.highlight(r, n.languages[a], a)), l && _self.close();
  }, !1), _self.Prism) : _self.Prism;var r = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();return r && (n.filename = r.src, n.manual || r.hasAttribute("data-manual") || ("loading" !== document.readyState ? window.requestAnimationFrame ? window.requestAnimationFrame(n.highlightAll) : window.setTimeout(n.highlightAll, 16) : document.addEventListener("DOMContentLoaded", n.highlightAll))), _self.Prism;
}();"undefined" != typeof module && module.exports && (module.exports = Prism), "undefined" != typeof global && (global.Prism = Prism);
Prism.languages.markup = { comment: /<!--[\s\S]*?-->/, prolog: /<\?[\s\S]+?\?>/, doctype: /<!DOCTYPE[\s\S]+?>/i, cdata: /<!\[CDATA\[[\s\S]*?]]>/i, tag: { pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i, inside: { tag: { pattern: /^<\/?[^\s>\/]+/i, inside: { punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/ } }, "attr-value": { pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i, inside: { punctuation: [/^=/, { pattern: /(^|[^\\])["']/, lookbehind: !0 }] } }, punctuation: /\/?>/, "attr-name": { pattern: /[^\s>\/]+/, inside: { namespace: /^[^\s>\/:]+:/ } } } }, entity: /&#?[\da-z]{1,8};/i }, Prism.languages.markup.tag.inside["attr-value"].inside.entity = Prism.languages.markup.entity, Prism.hooks.add("wrap", function (a) {
  "entity" === a.type && (a.attributes.title = a.content.replace(/&amp;/, "&"));
}), Prism.languages.xml = Prism.languages.markup, Prism.languages.html = Prism.languages.markup, Prism.languages.mathml = Prism.languages.markup, Prism.languages.svg = Prism.languages.markup;
Prism.languages.css = { comment: /\/\*[\s\S]*?\*\//, atrule: { pattern: /@[\w-]+?.*?(?:;|(?=\s*\{))/i, inside: { rule: /@[\w-]+/ } }, url: /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i, selector: /[^{}\s][^{};]*?(?=\s*\{)/, string: { pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: !0 }, property: /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i, important: /\B!important\b/i, "function": /[-a-z0-9]+(?=\()/i, punctuation: /[(){};:]/ }, Prism.languages.css.atrule.inside.rest = Prism.util.clone(Prism.languages.css), Prism.languages.markup && (Prism.languages.insertBefore("markup", "tag", { style: { pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i, lookbehind: !0, inside: Prism.languages.css, alias: "language-css" } }), Prism.languages.insertBefore("inside", "attr-value", { "style-attr": { pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i, inside: { "attr-name": { pattern: /^\s*style/i, inside: Prism.languages.markup.tag.inside }, punctuation: /^\s*=\s*['"]|['"]\s*$/, "attr-value": { pattern: /.+/i, inside: Prism.languages.css } }, alias: "language-css" } }, Prism.languages.markup.tag));
Prism.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: !0 }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0 }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: !0 }, "class-name": { pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i, lookbehind: !0, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/, "boolean": /\b(?:true|false)\b/, "function": /[a-z0-9_]+(?=\()/i, number: /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i, operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/, punctuation: /[{}[\];(),.:]/ };
Prism.languages.javascript = Prism.languages.extend("clike", { keyword: /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/, number: /\b-?(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|\d*\.?\d+(?:[Ee][+-]?\d+)?|NaN|Infinity)\b/, "function": /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\()/i, operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/ }), Prism.languages.insertBefore("javascript", "keyword", { regex: { pattern: /(^|[^\/])\/(?!\/)(\[[^\]\r\n]+]|\\.|[^\/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/, lookbehind: !0, greedy: !0 }, "function-variable": { pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=\s*(?:function\b|(?:\([^()]*\)|[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/i, alias: "function" } }), Prism.languages.insertBefore("javascript", "string", { "template-string": { pattern: /`(?:\\[\s\S]|[^\\`])*`/, greedy: !0, inside: { interpolation: { pattern: /\$\{[^}]+\}/, inside: { "interpolation-punctuation": { pattern: /^\$\{|\}$/, alias: "punctuation" }, rest: Prism.languages.javascript } }, string: /[\s\S]+/ } } }), Prism.languages.markup && Prism.languages.insertBefore("markup", "tag", { script: { pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i, lookbehind: !0, inside: Prism.languages.javascript, alias: "language-javascript" } }), Prism.languages.js = Prism.languages.javascript;
"use strict";

// Declare variables
var firstName,
    lastName,
    gender,
    email,
    genderData = [],
    submitBtn;

submitBtn = document.querySelector("#form-submit");

genderData = [{ list_ndx: "-1", list_display: "Please Select a Value" }, { list_ndx: "1", list_display: "Male" }, { list_ndx: "2", list_display: "Female" }];

firstName = new textInput({
  container: "#first-name",
  validation: {
    enabled: true,
    value: "blank",
    message: "Please provide a first name"
  }
});

lastName = new textInput({
  container: "#last-name",
  validation: {
    enabled: true,
    value: "blank",
    message: "Please provide a last name"
  }
});

gender = new Dropdown({
  container: "#gender",
  validation: {
    enabled: true,
    value: "dropdown",
    message: "Please select a gender"
  }
});
gender.data = genderData;
gender.buildDropdown();

email = new textInput({
  container: "#email",
  validation: {
    enabled: true,
    value: "blank",
    message: "Please provide a email"
  }
});

firstName.val("Ben");

function returnValues() {
  return {
    first_name: firstName.val(),
    last_name: lastName.val(),
    gender: gender.val(),
    email: email.val()
  };
}

submitBtn.addEventListener("click", function (event) {
  event.preventDefault();
  var values = returnValues();
  console.log(values);
});
"use strict";

/*! showdown-prettify 04-06-2015 */

!function () {
  var a = function a() {
    return [{ type: "output", filter: function filter(a) {
        return a.replace(/(<pre[^>]*>)?[\n\s]?<code([^>]*)>/gi, function (a, b, c) {
          return b ? '<pre class="prettyprint linenums"><code' + c + ">" : ' <code class="prettyprint">';
        });
      } }];
  };"undefined" != typeof window && window.showdown && window.showdown.extensions && (window.showdown.extensions.prettify = a), "undefined" != typeof module && (module.exports = a);
}();
//# sourceMappingURL=showdown-prettify.min.js.map
"use strict";

/*! showdown-table 17-06-2015 */

!function () {
  "use strict";
  var a = function a(_a) {
    var b,
        c = {},
        d = "text-align:left;";return c.th = function (a) {
      if ("" === a.trim()) return "";var b = a.trim().replace(/ /g, "_").toLowerCase();return '<th id="' + b + '" style="' + d + '">' + a + "</th>";
    }, c.td = function (b) {
      return '<td style="' + d + '">' + _a.makeHtml(b) + "</td>";
    }, c.ths = function () {
      var a = "",
          b = 0,
          d = [].slice.apply(arguments);for (b; b < d.length; b += 1) {
        a += c.th(d[b]) + "\n";
      }return a;
    }, c.tds = function () {
      var a = "",
          b = 0,
          d = [].slice.apply(arguments);for (b; b < d.length; b += 1) {
        a += c.td(d[b]) + "\n";
      }return a;
    }, c.thead = function () {
      var a,
          b = [].slice.apply(arguments);return a = "<thead>\n", a += "<tr>\n", a += c.ths.apply(this, b), a += "</tr>\n", a += "</thead>\n";
    }, c.tr = function () {
      var a,
          b = [].slice.apply(arguments);return a = "<tr>\n", a += c.tds.apply(this, b), a += "</tr>\n";
    }, b = function b(a) {
      var b,
          d,
          e = 0,
          f = a.split("\n"),
          g = [];for (e; e < f.length; e += 1) {
        if (b = f[e], b.trim().match(/^[|].*[|]$/)) {
          b = b.trim();var h = [];if (h.push("<table>"), d = b.substring(1, b.length - 1).split("|"), h.push(c.thead.apply(this, d)), b = f[++e], b.trim().match(/^[|][-=|: ]+[|]$/)) {
            for (b = f[++e], h.push("<tbody>"); b.trim().match(/^[|].*[|]$/);) {
              b = b.trim(), h.push(c.tr.apply(this, b.substring(1, b.length - 1).split("|"))), b = f[++e];
            }h.push("</tbody>"), h.push("</table>"), g.push(h.join("\n"));continue;
          }b = f[--e];
        }g.push(b);
      }return g.join("\n");
    }, [{ type: "lang", filter: b }];
  };"undefined" != typeof window && window.showdown && window.showdown.extensions && (window.showdown.extensions.table = a), "undefined" != typeof module && (module.exports = a);
}();
//# sourceMappingURL=showdown-table.min.js.map
//# sourceMappingURL=all.js.map
