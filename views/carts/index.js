$.get("/user/username", function (data) {
    document.getElementById("greeting").innerHTML = "Welcome " + data.FirstName;
    sessionStorage.setItem("UserName", JSON.stringify(data.UserName));
});

$.get("/user/carts", function (data) {
    var i;
    for (i = 0; i < data.length; i++) {
        newElement(data[i]);
    }
});

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");

var select = document.getElementsByClassName("select");

var edit = document.getElementsByClassName("edit");

var share = document.getElementsByClassName("share");


function start() {
    // Add a "checked" symbol when clicking on a list item
    var list = document.querySelector('ul');
    if (list) {
        console.log(list);
        list.addEventListener('click', function (ev) {
            if (ev.target.tagName === 'LI') {
                if(document.getElementById(ev.target.id).isContentEditable === false){

                ev.target.classList.toggle('disabled');

                var iscomplete;
                if (ev.target.classList.value == 'disabled') {
                    iscomplete = true;
                } else {
                    iscomplete = false;
                }

                var listname = ev.target.textContent.substring(0, ev.target.textContent.length - 16)
                var data = { Completed: iscomplete, ListName: listname };
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: '/completed',
                    success: function (data) {
                        console.log('success');
                        console.log(JSON.stringify(data));
                    }
                });
            }
            }
        }, false);
    }
}

function newInput() {
    var Name = document.getElementById("myInput").value
    newElement(Name);

    var data = {
        ListName: Name,
        DateAdded: todaysDate(),
        DateLastModified: todaysDate(),
        Completed: false,
        Items: []
    }
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/add',
        success: function (data) {
            console.log('success');
            console.log(JSON.stringify(data));
        }
    });
}

function todaysDate(){

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
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

// Create a new list item when clicking on the "Add" button
function newElement(ListEntry) {
  var li = document.createElement("li");
  li.className = "list-group-item";
  var inputValue = ListEntry;
  li.id = 'li'+ListEntry;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";
  var span2 = document.createElement("SPAN");
  var txt2 = document.createTextNode("Open item list");
  span2.className = "select";
  span2.appendChild(txt2);
  li.appendChild(span2);

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

    var span3 = document.createElement("SPAN");
    var txt3 = document.createTextNode(String.fromCharCode(9998));
    var txt4 = document.createTextNode(String.fromCharCode(10003));
    span3.className = "edit";
    span3.appendChild(txt3);
    li.appendChild(span3);

    var span4 = document.createElement("SPAN");
    var txt5 = document.createTextNode("share");
    span4.className = "share material-icons";
    span4.appendChild(txt5);
    li.appendChild(span4);

    span.id = inputValue;
    span.onclick = function () {
        var data = { ListName: span.id };
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/delete',
            success: function (data) {
                console.log('success');
                console.log(JSON.stringify(data));
            }
        });
        document.location.href = "/carts";
    }

    span2.id = inputValue;
    span2.onclick = function () {
        $.ajax({
            type: 'GET',
            url: "/user/cart/" + span2.id,
            data: "",
            contentType: "application/json",
            dataType: 'json',
            success: function (data) {
                console.log('success');
                console.log(JSON.stringify(data));
                sessionStorage.setItem("Lists", JSON.stringify(data));
                window.location.href = "/items";
            },
        });
    }

    span3.id = inputValue;
    span3.onclick = function () {
        if (document.getElementById(li.id).contentEditable === "true") {
            var editedtxt = li.firstChild.textContent;
            $.ajax({
                type: 'PUT',
                url: '/user/cart/' + span3.id,
                data: { ListName: editedtxt }
            }).done(function (response) {

                console.log(response);
                alert("Succesfully Changed Name");
            }).fail(function (response) {
                alert("Something Went Wrong!");
            });
            document.getElementById(li.id).contentEditable = "false"
            span3.replaceChild(txt3, txt4);
            li.appendChild(span3)
        }
        else {
            document.getElementById(li.id).contentEditable = "true";
            span3.replaceChild(txt4, txt3);
            li.appendChild(span3)
        }
    };

    span4.id = inputValue;
    span4.onclick = function () {
        var person = prompt("Please enter username you wish to share "+span4.id+" with:", "");
        if (person == null || person == "") {
            txt = "User cancelled the prompt.";
        } else {
            if (person === JSON.parse(sessionStorage.getItem("UserName"))) {
                alert("Cannot share List with yourself!!");
                return;
            } else {
                var ListName = span4.id;
                console.log(ListName)
                var data = { ListName: ListName, UserName: person };
                $.ajax({
                    type: 'POST',
                    url: "/user/share",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    dataType: 'json',
                    success: function (data) {
                        console.log('success');
                        console.log(JSON.stringify(data));
                    },
                });
            };
        }
    };
}