// source: http://codepen.io/adventuresinmissions/pen/celjI
jQuery(document).ready(function($) {
  var formModal = $('.cd-user-modal');
  var formLogin = formModal.find('#cd-login');
  var formForgotPassword = formModal.find('#cd-reset-password');
  var formModalTab = $('.cd-switcher');
  var tabLogin = formModalTab.children('li').eq(0).children('a');
  var tabSignup = formModalTab.children('li').eq(1).children('a');
  var forgotPasswordLink = formLogin.find('.cd-form-bottom-message a');
  var backToLoginLink = formForgotPassword.find('.cd-form-bottom-message a');
  var mainNav = $('.main-nav');

  var validPassRegex=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,20}$/;
  var validColor = "#66cc66";
  var invalidColor = "#ff6666";

  var formSignup = formModal.find('#cd-signup');
  var signupPasswordInput = formSignup.find('#password');
  var signupConfirmInput = formSignup.find('#confirm');
  var signupSubmitButton = formSignup.find('#signup-submit');
  var origSignupButtonBackground = signupSubmitButton.css('backgroundColor');
  signupSubmitButton.prop("disabled", true);
  signupSubmitButton.css('backgroundColor', '#ccc');

  var formResetPassword = $('#cd-reset-password-now');
  var forgotPasswordInput = formResetPassword.find('#password');
  var forgotConfirmInput = formResetPassword.find('#confirm');
  var forgotResetButton = formResetPassword.find('#pw-reset-button');
  var origResetButtonBackground = forgotResetButton.css('backgroundColor');
  forgotResetButton.prop("disabled", true);
  forgotResetButton.css('backgroundColor', '#ccc');

  //open modal
  mainNav.on('click', function(event){
    $(event.target).is(mainNav) && mainNav.children('ul').toggleClass('is-visible');
  });

  //open sign-up form
  mainNav.on('click', '#signup', signup_selected);
  $('#lead-signup').on('click', signup_selected);
  //open login-form form
  mainNav.on('click', '#signin', login_selected);

  //close modal
  formModal.on('click', function(event){
    if( $(event.target).is(formModal) || $(event.target).is('.cd-close-form') ) {
      formModal.removeClass('is-visible');
    }
  });
  //close modal when clicking the esc keyboard button
  $(document).keyup(function(event){
    if(event.which=='27'){
      formModal.removeClass('is-visible');
    }
  });

  //switch from a tab to another
  formModalTab.on('click', function(event) {
    event.preventDefault();
    ( $(event.target).is( tabLogin ) ) ? login_selected() : signup_selected();
  });

  //hide or show password
  $('.hide-password').on('click', function(){
    var togglePass= $(this),
      passwordField = togglePass.prev('input');

    ( 'password' == passwordField.attr('type') ) ? passwordField.attr('type', 'text') : passwordField.attr('type', 'password');
    ( 'Hide' == togglePass.text() ) ? togglePass.text('Show') : togglePass.text('Hide');
    //focus and move cursor to the end of input field
    passwordField.putCursorAtEnd();
  });

  //show forgot-password form
  forgotPasswordLink.on('click', function(event){
    event.preventDefault();
    forgot_password_selected();
  });

  //back to login from the forgot-password form
  backToLoginLink.on('click', function(event){
    event.preventDefault();
    login_selected();
  });

  function login_selected(){
    mainNav.children('ul').removeClass('is-visible');
    formModal.addClass('is-visible');
    formLogin.addClass('is-selected');
    formSignup.removeClass('is-selected');
    formForgotPassword.removeClass('is-selected');
    tabLogin.addClass('selected');
    tabSignup.removeClass('selected');
  }

  function signup_selected(){
    mainNav.children('ul').removeClass('is-visible');
    formModal.addClass('is-visible');
    formLogin.removeClass('is-selected');
    formSignup.addClass('is-selected');
    formForgotPassword.removeClass('is-selected');
    tabLogin.removeClass('selected');
    tabSignup.addClass('selected');
  }

  function forgot_password_selected(){
   formLogin.removeClass('is-selected');
   formSignup.removeClass('is-selected');
   formForgotPassword.addClass('is-selected');
  }

  function validateSignupPassword() {
    if (!signupPasswordInput.val().match(validPassRegex)) {
      signupConfirmInput.css('backgroundColor', invalidColor);
      return false;
    } else {
      if (signupPasswordInput.val() === signupConfirmInput.val()) {
        signupConfirmInput.css('backgroundColor', validColor);
        return true;
      } else {
        signupConfirmInput.css('backgroundColor', invalidColor);
        return false;
      }
    }
  }

  function validateSignupEmail() {
    var validEmailRegex = /.+@.+/;
    if (formSignup.find('#email').val().match(validEmailRegex)) {
      return true;
    }
    return false;
  }

  function validateRegFields() {
    if (formSignup.find('#username').val() &&
      formSignup.find('#yearborn').val() &&
      formSignup.find('#f_elem_city').val() ) {
      return true;
    }
    return false;
  }

  function validateSignupForm() {
    var isValid = validateSignupPassword() && validateSignupEmail() && validateRegFields();
    if (isValid) {
      signupSubmitButton.prop("disabled", false);
      signupSubmitButton.css('backgroundColor', origSignupButtonBackground);
    } else {
      signupSubmitButton.prop("disabled", true);
      signupSubmitButton.css('backgroundColor', '#ccc');
    }
  }

  formSignup.keyup(function() {
    validateSignupForm();
  });

  formResetPassword.keyup(function() {
    if (!forgotPasswordInput.val().match(validPassRegex)) {
      forgotConfirmInput.css('backgroundColor', invalidColor);
      forgotResetButton.prop("disabled", true);
      forgotResetButton.css('backgroundColor', '#ccc');
    } else {
      if (forgotPasswordInput.val() === forgotConfirmInput.val()) {
        forgotConfirmInput.css('backgroundColor', validColor);
        forgotResetButton.prop("disabled", false);
        forgotResetButton.css('backgroundColor', origResetButtonBackground);
      } else {
        forgotConfirmInput.css('backgroundColor', invalidColor);
        forgotResetButton.prop("disabled", true);
        forgotResetButton.css('backgroundColor', '#ccc');
      }
    }
  });

  // formLogin.find('input[type="submit"]').on('click', function(event){
  //   event.preventDefault();
  //   formLogin.find('form').submit();
  //   error msg handling
  //   formLogin.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
  // });
  // formSignup.find('input[type="submit"]').on('click', function(event){
  //   event.preventDefault();
  //   formSignup.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
  // });


  //IE9 placeholder fallback
  //credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
  if(!Modernizr.input.placeholder){
    $('[placeholder]').focus(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
        }
    }).blur(function() {
      var input = $(this);
        if (input.val() == '' || input.val() == input.attr('placeholder')) {
        input.val(input.attr('placeholder'));
        }
    }).blur();
    $('[placeholder]').parents('form').submit(function() {
        $(this).find('[placeholder]').each(function() {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
          input.val('');
        }
        })
    });
  }

  $("#f_elem_city").autocomplete({
    source: function (request, response) {
     $.getJSON(
      "http://gd.geobytes.com/AutoCompleteCity?callback=?&q="+request.term,
      function (data) {
       response(data);
      }
     );
    },
    minLength: 3,
    select: function (event, ui) {
      var selectedObj = ui.item;
      $("#f_elem_city").val(selectedObj.value);
      return false;
    },
    open: function () {
      $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
    },
    close: function () {
      $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
  });
  $("#f_elem_city").autocomplete("option", "delay", 100);

});

//credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
jQuery.fn.putCursorAtEnd = function() {
  return this.each(function() {
      // If this function exists...
      if (this.setSelectionRange) {
          // ... then use it (Doesn't work in IE)
          // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
          var len = $(this).val().length * 2;
          this.focus();
          this.setSelectionRange(len, len);
      } else {
        // ... otherwise replace the contents with itself
        // (Doesn't work in Google Chrome)
          $(this).val($(this).val());
      }
  });
};
