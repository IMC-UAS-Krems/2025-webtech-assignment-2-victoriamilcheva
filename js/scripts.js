// putting comments and sources on the things i learned on the internet about js 
//the css and the html were fairly easy to write, due to the previous assignment
//bootstrap attributes were found on the original website

var DISCOUNT_THRESHOLD = 3;    
var DISCOUNT_RATE = 0.10;  
var TAX_RATE = 0.07;    
var DAILY_GOAL = 500;   

var cart = [];

function formatCurrency(value) {
    return "€" + value.toFixed(2);
}

function calculateTotals() {
    var subtotal = 0;
    var totalQty = 0;

    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        subtotal += item.price * item.quantity; 
        totalQty += item.quantity;      
    }

    var discount = 0;
    if (totalQty >= DISCOUNT_THRESHOLD) {
        discount = subtotal * DISCOUNT_RATE;
    }

    var taxBase = subtotal - discount;
    var tax = taxBase * TAX_RATE;
    var total = taxBase + tax;

    return {
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        totalQty: totalQty
    }; //returns them all in one object
}

function renderCart() {
    var cartBody = document.getElementById("cartItems");
    var emptyText = document.getElementById("emptyCartText");

    cartBody.innerHTML = "";

    if (cart.length === 0) {
        emptyText.classList.remove("d-none");
    } else {
        emptyText.classList.add("d-none");
    }

    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var row = document.createElement("tr"); //creating a <tr> for each element in the cart

        row.innerHTML =
            '<td>' + item.name + '</td>' +
            '<td class="text-end">' + formatCurrency(item.price) + '</td>' +
            '<td class="text-center" style="max-width: 70px;">' +
                '<input type="number" min="1" class="form-control form-control-sm text-center item-qty"' +
                ' data-id="' + item.id + '" value="' + item.quantity + '">' +
            '</td>' +
            '<td class="text-end">' + formatCurrency(item.price * item.quantity) + '</td>' +
            '<td class="text-end">' +
                '<button class="btn btn-sm btn-link text-danger p-0 remove-item-btn" data-id="' + item.id + '">×</button>' +
            '</td>';

        cartBody.appendChild(row); //self-explanatory, still a new function
    }

    updateSummary();
}

function updateSummary() {
    var totals = calculateTotals();

    var subtotal = totals.subtotal;
    var discount = totals.discount;
    var tax = totals.tax;
    var total = totals.total;
    var totalQty = totals.totalQty;

    // .textContent - returns the text content of the specified node
    document.getElementById("summarySubtotal").textContent = formatCurrency(subtotal);
    document.getElementById("summaryDiscount").textContent = "– " + formatCurrency(discount);
    document.getElementById("summaryTax").textContent = formatCurrency(tax);
    document.getElementById("summaryTotal").textContent = formatCurrency(total);

    document.getElementById("navCartCount").textContent = totalQty;

    var itemsToDiscount = Math.max(DISCOUNT_THRESHOLD - totalQty, 0);
    var infoSpan = document.getElementById("itemsToDiscount");

    if (itemsToDiscount > 0) {
        infoSpan.innerHTML =
            'Add ' + itemsToDiscount + ' more item(s) to unlock <strong>10% charity bundle discount</strong>.';
    } else {
        infoSpan.textContent = "Discount unlocked!";
    }

    // using js to make the bar go up depending on how many more items we need to get a discount
    var progressPercent = Math.min((totalQty / DISCOUNT_THRESHOLD) * 100, 100);
    document.getElementById("discountProgress").style.width = progressPercent + "%";
    
    document.getElementById("donationRaised").textContent = formatCurrency(total);
    var goalPercent = Math.min((total / DAILY_GOAL) * 100, 100);
    document.getElementById("donationProgress").style.width = goalPercent + "%"; 
    //Same as the other progress bar

    var checkoutSummary = document.getElementById("checkoutSummary");
    if (checkoutSummary) {
        checkoutSummary.innerHTML =
            '<ul class="list-unstyled small">' +
                '<li class="d-flex justify-content-between">' +
                    '<span>Items:</span>' +
                    '<span>' + totalQty + '</span>' +
                '</li>' +
                '<li class="d-flex justify-content-between">' +
                    '<span>Subtotal:</span>' +
                    '<span>' + formatCurrency(subtotal) + '</span>' +
                '</li>' +
                '<li class="d-flex justify-content-between">' +
                    '<span>Discount:</span>' +
                    '<span>– ' + formatCurrency(discount) + '</span>' +
                '</li>' +
                '<li class="d-flex justify-content-between">' +
                    '<span>Tax:</span>' +
                    '<span>' + formatCurrency(tax) + '</span>' +
                '</li>' +
                '<li class="d-flex justify-content-between fw-semibold border-top pt-2 mt-2">' +
                    '<span>Total:</span>' +
                    '<span>' + formatCurrency(total) + '</span>' +
                '</li>' +
            '</ul>';
    }
}


function addToCart(name, price) {
    var id = name.toLowerCase().replace(/\s+/g, "-"); //the id has to have dashes inbetween the words, so we transform it

    var existingItem = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            existingItem = cart[i];
            break;
        }
    }

    if (existingItem !== null) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: Number(price),
            quantity: 1
        });
    }

    renderCart();
    showAddedAlert();
}

function showAddedAlert() {
    var alertEl = document.getElementById("addedAlert");
    alertEl.classList.remove("d-none");
    alertEl.classList.add("show");

    // Hide it again after 1.2 seconds
    setTimeout(function () { //sets a timer so that when it ends (in this case after 1.2 secs) a certain function get executed
        alertEl.classList.add("d-none");
        alertEl.classList.remove("show");
    }, 1200);
}

// Shows only one main section: cart, checkout OR confirmation.
function showSection(sectionId) {
    var cartSection = document.getElementById("cartSection");
    var checkoutSection = document.getElementById("checkoutSection");
    var confirmationSection = document.getElementById("confirmationSection");

    cartSection.classList.add("d-none");
    checkoutSection.classList.add("d-none");
    confirmationSection.classList.add("d-none");

    document.getElementById(sectionId).classList.remove("d-none");
}

function buildConfirmationDetails(formData) {
    var totals = calculateTotals();
    var subtotal = totals.subtotal;
    var discount = totals.discount;
    var tax = totals.tax;
    var total = totals.total;

    var rowsHtml = "";
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        rowsHtml +=
            "<tr>" +
                "<td>" + item.name + "</td>" +
                '<td class="text-end">' + item.quantity + "</td>" +
                '<td class="text-end">' + formatCurrency(item.price * item.quantity) + "</td>" +
            "</tr>";
    } //build a <tr> for each item

    //confirmation section
    var html =
        '<h3 class="h6 mt-3 mb-2">Donation items</h3>' +
        '<div class="table-responsive">' +
            '<table class="table table-sm">' +
                "<thead>" +
                    "<tr>" +
                        "<th>Item</th>" +
                        '<th class="text-end">Qty</th>' +
                        '<th class="text-end">Total</th>' +
                    "</tr>" +
                "</thead>" +
                "<tbody>" + rowsHtml + "</tbody>" +
                "<tfoot>" +
                    "<tr>" +
                        '<th colspan="2" class="text-end">Subtotal</th>' +
                        '<th class="text-end">' + formatCurrency(subtotal) + "</th>" +
                    "</tr>" +
                    "<tr>" +
                        '<th colspan="2" class="text-end">Discount</th>' +
                        '<th class="text-end">– ' + formatCurrency(discount) + "</th>" +
                    "</tr>" +
                    "<tr>" +
                        '<th colspan="2" class="text-end">Tax</th>' +
                        '<th class="text-end">' + formatCurrency(tax) + "</th>" +
                    "</tr>" +
                    '<tr class="fw-semibold">' +
                        '<th colspan="2" class="text-end">Total donation</th>' +
                        '<th class="text-end">' + formatCurrency(total) + "</th>" +
                    "</tr>" +
                "</tfoot>" +
            "</table>" +
        "</div>" +
        '<h3 class="h6 mt-4 mb-2">Donor details</h3>' +
        '<p class="small mb-1">' +
            formData.firstName + " " + formData.lastName + "<br>" +
            formData.address + "<br>" +
            formData.zip + " " + formData.city + ", " + formData.country + "<br>" +
            "Phone: " + formData.phone + "<br>" +
            "Email: " + formData.email +
        "</p>";

    if (formData.note) {
        html += '<p class="small mb-0"><strong>Note:</strong> ' + formData.note + "</p>";
    }

    return html;
}

function extraValidation() {
    var phoneInput = document.getElementById("phone");
    var zipInput = document.getElementById("zip");

    var phoneClean = phoneInput.value.replace(/\s+/g, "");
    var phoneValid = /^[0-9]{6,15}$/.test(phoneClean);

    if (!phoneValid) {
        phoneInput.setCustomValidity("Phone must contain 6–15 digits.");
    } else {
        phoneInput.setCustomValidity("");
    }

    var zipValue = zipInput.value.trim();
    var zipValid = zipValue.length > 0 && zipValue.length <= 6;

    if (!zipValid) {
        zipInput.setCustomValidity("ZIP code must be max. 6 characters.");
    } else {
        zipInput.setCustomValidity("");
    }
}
//regexes googles

document.addEventListener("DOMContentLoaded", function () {

    var addButtons = document.querySelectorAll(".add-to-cart-btn");
    for (var i = 0; i < addButtons.length; i++) {
        addButtons[i].addEventListener("click", function (event) {
            var button = event.currentTarget;
            var name = button.getAttribute("data-name");
            var price = Number(button.getAttribute("data-price")); //didn't know that's the wording of how you get a value
            addToCart(name, price);
        });
    }

    var cartBody = document.getElementById("cartItems");
    //when the quantity input changes
    cartBody.addEventListener("input", function (event) {
        if (event.target.classList.contains("item-qty")) {
            var id = event.target.getAttribute("data-id");
            var newQty = Number(event.target.value);

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].id === id) {
                    if (newQty <= 0) {
                        cart.splice(i, 1); //removes array els
                    } else {
                        cart[i].quantity = newQty;
                    }
                    break;
                }
            }
            renderCart();
        }
    });

    cartBody.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-item-btn")) { //clicking the x
            var id = event.target.getAttribute("data-id");

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].id === id) {
                    cart.splice(i, 1);
                    break;
                }
            }
            renderCart();
        }
    });

    var checkoutBtn = document.getElementById("checkoutBtn");
    checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) {
            alert("Your cart is empty. Please add at least one donation pack.");
            return;
        }
        showSection("checkoutSection");
        updateSummary(); 
    });

    var continueBtn = document.getElementById("continueShoppingBtn");
    continueBtn.addEventListener("click", function () {
        var gallery = document.getElementById("gallery");
        gallery.scrollIntoView({ behavior: "smooth" }); //scrolling into a certain part of the page when an action is executed
    });

    var navCartBtn = document.getElementById("navCartBtn");
    navCartBtn.addEventListener("click", function () {
        var cartSection = document.getElementById("cartSection");
        cartSection.scrollIntoView({ behavior: "smooth" });
    });

    var form = document.getElementById("checkoutForm");
    form.addEventListener("submit", function (event) {
        extraValidation();

        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            form.classList.add("was-validated");
            return;
        } // if it says invalid show bootstrap error styles

        event.preventDefault(); // do not actually send data anywhere

        // all form values into one
        var data = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            zip: document.getElementById("zip").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value.trim(),
            country: document.getElementById("country").value.trim(),
            note: document.getElementById("note").value.trim()
        };

        // Put data into confirmation section
        document.getElementById("confEmail").textContent = data.email;
        document.getElementById("confirmationDetails").innerHTML =
            buildConfirmationDetails(data);

        showSection("confirmationSection");
    });

    //in case of another donation
    var backToStartBtn = document.getElementById("backToStartBtn");
    backToStartBtn.addEventListener("click", function () {
        cart = [];               
        renderCart();        
        form.reset();   // clear the form inputs
        form.classList.remove("was-validated");
        showSection("cartSection");
    });

    //render when the page is loaded
    renderCart();
});
