$.get("/user/username", function (data) {
    console.log(data.FirstName)
    document.getElementById("WelcomeMessage").innerHTML = "Hi " + data.FirstName + " what's for dinner? Choose a recipe!";
    sessionStorage.setItem("UserName", JSON.stringify(data.UserName));
});

function createList() {
    var list = document.querySelector('ul');
    if (list) {
        console.log(list);
        list.addEventListener('click', function (ev) {
            if (ev.target.tagName === 'LI') {
                if (confirm('Would you like to add this recipe to a shopping list?')) {
                    var recipeName = ev.target.textContent
                    var Recipes = JSON.parse(sessionStorage.getItem("Recipes"))
                    var RecipeID = JSON.parse(sessionStorage.getItem("RecipeID"))

                    var index;
                    for (index = 0; index < Recipes.length; index++) {
                        if (recipeName === Recipes[index]) {
                            break;
                        }
                    }
                    
                    var data = { RecipeID: RecipeID[index], RecipeName: recipeName, Date: todaysDate() }
                    console.log(data)
                    $.ajax({
                        type: 'POST',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        url: '/addRecipeList',
                        success: function (data) {
                            console.log('success');
                            console.log(JSON.stringify(data));                      
                        }
                    });
                    alert('Your new list has been created! Bon Appetit');
                } 
            }
        }, false);
    }
}

function todaysDate() {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = mm + '/' + dd + '/' + yyyy;
    return today;
}



function newInput() {
    var ingredients = document.getElementById("ingredients").value
    if (ingredients === '') {
        alert("You must write something!");
    } else {
        var data = { Ingredients: ingredients }
        document.getElementById("recipelist").innerHTML = "";
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/searchRecipe',
            success: function (data) {
                console.log('success');
                console.log(JSON.stringify(data));
                sessionStorage.setItem("Links", JSON.stringify(data.Link));
                sessionStorage.setItem("Recipes", JSON.stringify(data.Recipes));
                sessionStorage.setItem("RecipeID", JSON.stringify(data.RecipeID));

                var i;
                for (i = 0; i < data.Recipes.length; i++) {
                    console.log(data.Recipes[i])
                    newElement(data.Recipes[i]);
                }

            }
        });
    }
}

function newElement(ListEntry) {
    var li = document.createElement("li");
    li.className = "list-group-item";
    var inputValue = ListEntry
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') {
        alert("You must write something!");
    } else {
        document.getElementById("recipelist").appendChild(li);
    }
    document.getElementById("ingredients").value = "";

    var span = document.createElement("SPAN");
    span.className = "links glyphicon glyphicon-link  ";
    li.appendChild(span);

    span.id = inputValue;
    span.onclick = function () {
        var Link = JSON.parse(sessionStorage.getItem("Links"))
        var Recipes = JSON.parse(sessionStorage.getItem("Recipes"))
        var index;
        for (index = 0; index < Recipes.length; index++) {
            if (span.id === Recipes[index]) {
                console.log(Link[index])
                console.log(Recipes[index])
                window.open(Link[index], "_blank");
                break;
            }
        }
    }
}