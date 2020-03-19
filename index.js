// grab UI elements
const form = document.getElementById("form");
const flavor = document.getElementById("flavor");
const quantity = document.getElementById("quantity");
const error = document.getElementById("error");

//User Message handler
function userMessageHandler(msg){
    error.textContent = msg;
    setTimeout(() => {
        error.textContent = "";
    }, 3000);
} 



//add event listeners
form.addEventListener("submit", e => {
  e.preventDefault();

  if (flavor.value && quantity.value) {
    const item = {
      flavor: flavor.value,
      quantity: parseInt(quantity.value)
    };

    db.collection("wings")
      .add(item)
      .then(res => {
        flavor.value = "";
        quantity.value = "";
        userMessageHandler("Wings Added To Tracker!");
      });
  } else {
    userMessageHandler("Please enter values before submitting!");
  }
});
