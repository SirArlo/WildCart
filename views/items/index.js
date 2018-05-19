function start() {
    var data = JSON.parse(sessionStorage.getItem("Lists"));
    console.log("Index js data")
    console.log(data)
    document.getElementById("hey").innerHTML = "Hi " + data.UserName + " these are the items in " + data.ListName;
    document.getElementById("whatlist").innerHTML = data.ListName;

    for (var key in data.Items) {
        newElement(data.Items[key])
    }
}

var close = document.getElementsByClassName("close");

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
    var Name = document.getElementById("myInput").value
    var Price = document.getElementById("Price").value
    var category = document.getElementById("category").value
    var ListName = JSON.parse(sessionStorage.getItem("Lists")).ListName
    var data = {
        ItemName: Name,
        Price: Price,
        Catregory: category,
        DateAdded: todaysDate(),
        ListName: ListName
    }
    console.log(data)
    newElement(data);
    var temp = JSON.parse(sessionStorage.getItem("Lists"));
    temp.Items.push(data);
    sessionStorage.setItem("Lists", JSON.stringify(temp))
   
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/addItem',
        success: function (data) {
            console.log('success');
            console.log(JSON.stringify(data));
            
        }
    });
}

function newElement(ListEntry) {
    var li = document.createElement("li");
    li.className = "list-group-item";
    var inputValue = ListEntry.ItemName
    li.id = 'li' + ListEntry;
    var t = document.createTextNode(inputValue);
    li.appendChild(t);
    if (inputValue === '') {
        alert("You must write something!");
    } else {
        document.getElementById("itemList").appendChild(li);
    }
    document.getElementById("myInput").value = "";
    document.getElementById("Price").value = "";
    document.getElementById("category").value = "Category";

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    var span2 = document.createElement("SPAN");
    var txt2 = document.createTextNode("R"+ListEntry.Price);
    span2.className = "price";
    span2.appendChild(txt2);
    li.appendChild(span2);

    var span3 = document.createElement("SPAN");
    var txt3 = document.createTextNode(ListEntry.Catregory);
    span3.className = "category";
    span3.appendChild(txt3);
    li.appendChild(span3);

    span.id = inputValue;
    span.onclick = function () {
        var ListName = JSON.parse(sessionStorage.getItem("Lists")).ListName
        var data = { ItemName: span.id, ListName: ListName};
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/deleteItem',
            success: function (data) {
                console.log('success');
                console.log(JSON.stringify(data));
            }
        });
        var index;
        var temp = JSON.parse(sessionStorage.getItem("Lists"));
        for(index = 0; index < temp.Items.length; index++) {
            if (span.id === temp.Items[index].ItemName) {
                break;}
        }
        temp.Items.splice(index, 1)
        sessionStorage.setItem("Lists", JSON.stringify(temp))
        document.location.href = "/items";
    }


    var span4 = document.createElement("SPAN");
    var txt4 = document.createTextNode(String.fromCharCode(9998));
    var txt5 = document.createTextNode(String.fromCharCode(10003));
    span4.className = "edit";
    span4.appendChild(txt4);
    li.appendChild(span4);

    span4.id = inputValue;
    span4.onclick = function () {
        if (document.getElementById(li.id).contentEditable === "true") {
            var Name = JSON.parse(sessionStorage.getItem("Lists"));

            var data = {
                OldItemName: ListEntry.ItemName,
                ListName: Name.ListName,
                ItemName: li.firstChild.textContent,
                Price: span2.firstChild.textContent,
                Catregory: span3.firstChild.textContent,
                DateAdded: todaysDate()
            }
            console.log(data)
            $.ajax({
                type: 'POST',
                url: '/updateItem',
                data: data
            }).done(function (response) {

                console.log(response);
                alert("Succesfully Updated Item");
            }).fail(function (response) {
                alert("Something Went Wrong!");
            });
            document.getElementById(li.id).contentEditable = "false"
            span4.replaceChild(txt4, txt5);
            li.appendChild(span4)
        }
        else {
            document.getElementById(li.id).contentEditable = "true";
            span4.replaceChild(txt5, txt4);
            li.appendChild(span4)
        }
    };
}