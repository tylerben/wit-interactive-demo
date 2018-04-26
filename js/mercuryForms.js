/**
 * Create a base constructor function to create a basic form element
 * @param  {options} options [Form element configuration options]
 */
var formElement = function (options) {
	this.container = document.querySelector( options.container );
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
	}
	this.bindEvents();
	this.init();
}

/**
 * This function is used to initialize the form element
 * @return {object} [returns the formElement object]
 */
formElement.prototype.init = function() {
	if ( typeof this.placeholder !== "undefined" ) {
		this.setPlaceholder(this.placeholder);
	}
	return this;
}

/**
 * This function is used to set the data
 * @param {array} data [array to set as data]
 */
formElement.prototype.setData = function(data) {
	this.data = data;
	return this;
}

/**
 * Function used to add class to form element
 * @param {string} cssClass [CSS class to add]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.addClass = function(cssClass) {
	if ( this.container.classList.contains(cssClass) ) {
		this.container.classList.remove(cssClass);
		this.container.classList.add(cssClass);
	} else {
		this.container.classList.add(cssClass);
	}
	return this;
}

/**
 * Function used to remove class from form element
 * @param {string} cssClass [CSS class to remove]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.removeClass = function(cssClass) {
	if ( this.container.classList.contains(cssClass) ) {
		this.container.classList.remove(cssClass);
	}	
	return this;
}

/**
 * Function used to get/set form element disabled state
 * @param  {boolean} state [boolean used to set disabled state]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.disabled = function(state) {
	if (typeof state === "undefined") {
		var disabled = this.container.getAttribute("disabled");
		if (disabled === null) { 
			return false;
		} else {
			return true;
		}
	} else {
		this.container.removeAttribute("readonly");
		if ( state === true ) {
			this.container.setAttribute("disabled", "disabled");
		} else {
			this.container.removeAttribute("disabled");
		} 
	}
	return this;
}

/**
 * Function used to get/set form element readonly state
 * @param  {boolean} state [boolean used to set readonly state]
 * @return {object}       [returns formElement object]
 */
formElement.prototype.readonly = function(state) {
	if (typeof state === "undefined") {
		var readonly = this.container.getAttribute("readonly");
		if (readonly === null) { 
			return false;
		} else {
			return true;
		}
	} else {
		this.container.removeAttribute("disabled");
		if ( state === true ) {
			this.container.setAttribute("readonly", "readonly");
		} else {
			this.container.removeAttribute("readonly");
		} 
	}
	return this;
}

/**
 * This function is used to set the placeholder text on a form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.setPlaceholder = function(placeholder) {	
	this.container.setAttribute("placeholder", placeholder);
	this.placeholder = placeholder;
	return this;
}

/**
 * This function is used to show the form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.show = function() {
	this.container.style.display = "";
	return this;
}

/**
 * This function is used to hide the form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.hide = function() {
	this.container.style.display = "none";
	return this;
}

/**
 * This function is used to validate the form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.validate = function() {
	if ( this.validation.enabled ) {
		var valid = checkValid(this.container, this.validation.value, this.validation.message);
		if ( !valid ) {
			this.error = true;
		} else {
			this.error = false;
		}
	}
	return this;
}

/**
 * This function is used to remove an error message from an input
 * @return {object} [returns formElement object]
 */
formElement.prototype.removeErrorMessage = function() {
	removeErrorMessage(this.container);
	return this;
}

/**
 * Function used to bind events to form element
 * @return {object} [returns formElement object]
 */
formElement.prototype.bindEvents = function() {
	this.container.addEventListener("change", this.onChange);
	this.container.addEventListener("blur", this.onBlur);
	this.container.addEventListener("keyup", this.onKeyup);
	this.container.addEventListener("focus", this.onFocus);

	if ( this.validation.enabled ) {
		var self = this;
		this.validation.events.forEach(function(v) {
			self.container.addEventListener(v, function() { 
				var valid = checkValid(self.container, self.validation.value, self.validation.message);
				if ( !valid ) {
					self.error = true;
				} else {
					self.error = false;
				}	
			})
		})
	}
	return this;
};


var Checkbox = function(options) {
	formElement.call(this, options);
	this.checked = options.checked || [];
	this.data = [];
	this.valueIndex  = options.valueIndex || 0;
	this.displayIndex = options.displayIndex || 1;
}
Checkbox.prototype = Object.create(formElement.prototype);

Checkbox.prototype.clearSelected = function() {
	var $checkboxes = this.container.querySelectorAll(' input[type="checkbox"]');
	$checkboxes.forEach(function(v,k) {
		v.checked = false;
	})
	return this;
}

Checkbox.prototype.setChecked = function() {
	this.checked = data;
	this.setCheckedStyle();
	return this;
}

Checkbox.prototype.buildCheckbox = function() {
	if (typeof this.data !== "undefined") {
		var self = this;
		keys = Object.keys(this.data[0]);
		this.container.innerHTML = "";
		this.data.forEach(function(v,k) {
			var div  = document.createElement("div");
			div.classList += 'checkbox-container checkbox-container-'+k;

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
		})
		this.setCheckedStyle();
		return this;
	}
}

Checkbox.prototype.setCheckedStyle = function() {
	var self = this;
	var $checkboxContainers = document.querySelectorAll(".checkbox-container");
	var $checkboxSpans = document.querySelectorAll(".checkbox-container span")
	$checkboxContainers.forEach(function(v,k) {
		v.classList.remove("active-checkbox-container");
	})

	$checkboxSpans.forEach(function(v,k) {
		v.classList.remove("active-checkbox");
	})

	this.checked.forEach(function(v,k) {
		var $check = self.container.querySelector(' input#checkbox-'+k);
		$check.checked = true;

		var $checkboxContainer = self.container.querySelector(' .checkbox-container-' + k).classList.add('active-checkbox-container');

		var $label = self.container.querySelector(' .checkbox-container-' + k + ' span').classList.add("active-checkbox");
	})
	return this;
}

Checkbox.prototype.getIndex = function() {
	var $checkboxes = this.container.querySelectorAll('input[type="checkbox"]');
	var selected = [];

	$checkboxes.forEach(function(v,k) {
		if ( v.checked ) {
			selected.push(k);
		}
	})
	return selected;
}

Checkbox.prototype.getValue = function() {
	return this.container.value;
}

Checkbox.prototype.isChecked = function() {
	if ( this.container.checked ) {
		return true;
	} else {
		return false;
	}
}

var datePicker = function(options) {
	formElement.call(this, options);
}
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
datePicker.prototype.setDate = function(date,days) {
	var properDate = new Date();
	var newDateFormatted = properDate.getFullYear() + '-' + ("0" + (properDate.getMonth()+1)).slice(-2) + '-' + ("0" + (properDate.getDate())).slice(-2);

	if (typeof date == "undefined" && typeof days === "undefined") {			
		this.container.value = newDateFormatted;
		return this;
	} else if (typeof date == "number" && typeof days === "undefined") {
		var days = date;
		var newDate = new Date(properDate.setDate(properDate.getDate() - days));
		newDateFormatted = newDate.getFullYear() + '-' + ("0" + (newDate.getMonth()+1)).slice(-2) + '-' + ("0" + (newDate.getDate())).slice(-2);
		this.container.value = newDateFormatted;
		return this;
	} else if (typeof date == "string" && typeof days !== "undefined") {
		properDate = new Date(date);
		var newDate = new Date(properDate.setDate(properDate.getDate() - days));
		newDateFormatted = newDate.getFullYear() + '-' + ("0" + (newDate.getMonth()+1)).slice(-2) + '-' + ("0" + (newDate.getDate()+1)).slice(-2);
		this.container.value = newDateFormatted;
		return this;
	} else {
		this.container.value = date;
		return this;
	}
}

/**
 * Function used to get date of date input
 * @return {object} [returns datePicker object]
 */
datePicker.prototype.getDate = function() {
	return this.container.value;
}

/**
 * Function used to add X days to date input
 * @param {number} days [number of days top add to input]
 * @return {object} [returns datePicker object]
 */
datePicker.prototype.addDaysToDate = function(days) {
	var date = this.container.value;
	var newDate = new Date(date);
	var momentDate = moment(newDate).add(2, 'd');
	var formattedDate = momentDate.format('YYYY-MM-DD');
	this.container.value = formattedDate;
	return this;
}

/**
 * Function used to format the date as "MM/DD/YYYY"
 * @param  {date} date [date to format]
 * @return {string}      [formatted date in "MM/DD/YYYY" format]
 */
datePicker.prototype.formatDate = function(date) {
	var properDate = new Date(date);
	var formattedDate = (properDate.getMonth() + 1) + '/' + (properDate.getDate() + 1) + '/' + properDate.getFullYear();
	return formattedDate;
}

var Dropdown = function(options) {
	formElement.call(this, options);
	this.valueIndex = options.valueIndex || 0;
	this.textIndex = options.textIndex || 1;
	this.selectedValue = options.selectedValue;
}
Dropdown.prototype = Object.create(formElement.prototype);

/**
 * This function is used to clear the dropdown of all options
 * @return {object} [Dropdown object]
 */
Dropdown.prototype.clearDropdown = function() {
	this.container.innerHTML = "";
	return this;
}

/**
 * This function is used to build the options for a Dropdown
 * @return {object} [Dropdown object]
 */
Dropdown.prototype.buildDropdown = function() {
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
		response.forEach(function(d) {
			var option = document.createElement('option');
			option.value = d[valueKey];
			option.textContent = d[textKey];
			self.container.appendChild(option);
		})

		if (typeof this.selectedValue !== "undefined") {
			this.container.value = this.selectedValue;
			this.value = this.selectedValue;
		} else {
			this.container.value = -1;
			this.value = -1;
		}
		return self;
	}
}

/**
 * This function is used to get/set the Dropdown value
 * @param  {number/string} value [Value to set the Dropdown too]
 * @return {object/number/string} [Dropdown object/currently selected option value]
 */
Dropdown.prototype.val = function(value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		if ( value == null ) {
			this.container.value = -1;
			this.value = -1;
		} else {
			this.container.value = value;
			this.value = value;
		}			
		return this;
	}
}

/**
 * Function used to return the text for the currently selected dropdown option
 * @return {string} [text for selected option]
 */
Dropdown.prototype.text = function() {
	var selected = this.container.options;
	return selected[selected.selectedIndex].text;
}

var dropdownMulti = function(options) {
	formElement.call(this, options);
	this.valueIndex = options.valueIndex || 0;
	this.textIndex = options.textIndex || 1;
	this.selectedValue = options.selectedValue;
}
dropdownMulti.prototype = Object.create(formElement.prototype);

/**
 * This function is used to clear the dropdown of all options
 * @return {object} [Dropdown object]
 */
dropdownMulti.prototype.clearDropdown = function() {
	this.container.innerHTML = "";
	return this;
}

/**
 * This function is used to build the options for a Dropdown
 * @return {object} [Dropdown object]
 */
dropdownMulti.prototype.buildDropdown = function() {
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
		response.forEach(function(d) {
			var option = document.createElement('option');
			option.value = d[valueKey];
			option.textContent = d[textKey];
			self.container.appendChild(option);
		})

		if (typeof this.selectedValue !== "undefined") {
			this.container.value = this.selectedValue;
			this.value = this.selectedValue;
		} else {
			this.container.value = -1;
			this.value = -1;
		}
		return self;
	}
}

dropdownMulti.prototype.val = function(value) {
	if (typeof value === "undefined") {
		var values = [];
		var options = this.container.options;

		for ( var i = 0; i < options.length; i++) {
			if ( options[i].selected ) {
				values.push(options[i].value);
			}
		}
		return values;
	} else {
		if ( value == null ) {
			this.container.value = -1;
			this.value = -1;
		} else {
			this.container.value = value;
			this.value = value;
		}			
		return this;
	}
}

/**
 * Function used to return the text for the currently selected dropdown option
 * @return {string} [text for selected option]
 */
dropdownMulti.prototype.text = function() {
	var selected = this.container.options;
	return selected[selected.selectedIndex].text;
}

var numberInput = function(options) {
	formElement.call(this, options);
}
numberInput.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
numberInput.prototype.val = function(value) {
	if ( typeof value === "undefined" ) {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;
		return this;
	}
}

var textInput = function(options) {
	formElement.call(this, options);
}
textInput.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
textInput.prototype.val = function(value) {
	if ( typeof value === "undefined" ) {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;
		return this;
	}
}

var textArea = function(options) {
	formElement.call(this, options);
}
textArea.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
textArea.prototype.val = function(value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;			
		return this;
	}
}

var timePicker = function(options) {
	formElement.call(this, options);
}
timePicker.prototype = Object.create(formElement.prototype);

/**
 * This Method is used to set the time for a time input
 * @param {string} time [time in format "HH:MM"]
 * @return {object}      [timePicker object]
 */
timePicker.prototype.setTime = function(time) {
	var properDate = new Date();
	this.container.value = time;
	return this;
}

/**
 * This Method is used to return the entered time for the time input
 * @return {object}      [timePicker object]
 */
timePicker.prototype.getTime = function() {
	return this.container.value;
}

var mercurySlider = function(options) {
	formElement.call(this, options);
}
mercurySlider.prototype = Object.create(formElement.prototype);

/**
 * Function used to get/set form element value
 * @param  {value} value [value to set form element at]
 * @return {object}       [returns formElement object]
 */
mercurySlider.prototype.val = function(value) {
	if (typeof value === "undefined") {
		return this.container.value;
	} else {
		this.container.value = value;
		this.value = value;			
		return this;
	}
}


// pattern found at https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
var emailRegEx = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

/**
 * Function used to add a CSS class to an element
 * Checks if element already has that class
 * @param {object} element   [HTML element to add the class to]
 * @param {string} className [classname to add to the element]
 */
function addClass(element, className) {
    if ( !element.classList.contains(className)) {
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

    if ( type === 'blank' ) {
        if ( val === "" ) {
            displayFormError(target, false, message);
            valid = false;
        } else {
            displayFormError(target, true);
            valid = true;
        }
    } else if ( type === "email" ) {
        if ( !emailRegEx.test(val) || val === "") {
            displayFormError(target, false, message);
            valid = false;
        } else {
            displayFormError(target, true);
            valid = true;
        }
    } else if ( type === "dropdown" ) {
        if ( val === "-1") {
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

    if ( sibling !== null ) {
	    if ( sibling.classList.contains('error-message') ) {
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
    if ( !valid && tagName === "input") {
        target.classList.add("error");
    } else if (tagName === "input") {
        target.classList.remove("error");
    }

    if ( !valid ) {
        removeErrorMessage(target);
        var error = document.createElement("span");
        error.textContent = message;
        addClass(error, 'error-message');
        target.insertAdjacentElement('beforeBegin', error)
    } else {
        removeErrorMessage(target);
    }
}


function displayFormSubmitError(target, message) {
    var target = document.querySelector(target);
    target.textContent = message;
    target.style.display = "";
}