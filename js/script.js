// Declare variables
var firstName,
    lastName,
    gender,
    email,
    genderData = [],
    submitBtn;

submitBtn = document.querySelector("#form-submit");

genderData = [
  {list_ndx: "-1", list_display: "Please Select a Value"},
  {list_ndx: "1", list_display: "Male"},
  {list_ndx: "2", list_display: "Female"}
]

firstName = new textInput({
  container: "#first-name",
  validation: {
    enabled: true,
    value: "blank",
    message: "Please provide a first name"
  }
})

lastName = new textInput({
  container: "#last-name",
  validation: {
    enabled: true,
    value: "blank",
    message: "Please provide a last name"
  }
})

gender = new Dropdown({
  container: "#gender",
  validation: {
    enabled: true,
    value: "dropdown",
    message: "Please select a gender"
  }
})
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
  }
}

submitBtn.addEventListener("click", function(event) {
  event.preventDefault();
  var values = returnValues();
  console.log(values);
})
