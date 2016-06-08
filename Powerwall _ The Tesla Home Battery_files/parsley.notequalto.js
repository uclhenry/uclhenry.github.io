(function () {

window.Parsley.addValidator(
    'notequalto',
    function (value, nbReference) {
        $reference = $('#'+nbReference).val();
        $net = value == $reference;
        return !$net;
    }, 32)
    .addMessage('en', 'notequalto', 'invalid duplicate entry');

})();