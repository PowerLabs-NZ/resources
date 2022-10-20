function load_dependencies() {
    var head = document.getElementsByClassName("head");
    
    JQscript = document.createElement("script");
    JQscript.src = "https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/dynamics/pl_jquery_3.5.1.js"

    head.append(JQscript);

    waitforJQ(function() {
        $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/dynamics/pl_bootstrap.css">');
        $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/dynamics/pl_custom_css.css">');
        $('head').append('<script src="https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/dynamics/pl_bootstrap.bundle.js"></script>');
        $('head').append('<script src="https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/dynamics/pl_custom_js.js"></script>');
        $('head').append('<script src="https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/dynamics/pl_jquery_3.5.1.js"></script>');
    });
    
    return true;
}

function waitforJQ(callback) {
    if ($) {
        console.log('PL JQuery Loaded');
        callback();
    } else {
        setTimeout(function() {
        waitForEl(callback);
        }, 100);
    }
}

function error() {
    console.log("This should not be triggerable");
}