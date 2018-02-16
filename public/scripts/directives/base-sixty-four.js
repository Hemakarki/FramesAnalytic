angular.module('framebridge').directive('baseSixtyFourInput', ['$window', function($window) {
        console.log("IN Derective");
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {
                var fileObject = {};

                scope.$watch(attrs.ngModel, function() {
                    var currentValue = ngModel.$modelValue;
                    if (currentValue) {
                        fileObject = currentValue;
                        ngModel.$setViewValue(fileObject);
                    }
                });

                scope.readerOnload = function(e) {
                    var base64 = _arrayBufferToBase64(e.target.result);
                    fileObject.base64 = base64;
                    scope.$apply(function() {
                        ngModel.$setViewValue(fileObject);
                    });
                };

                var reader = new FileReader();
                reader.onload = scope.readerOnload;

                elem.on('change', function() {
                    var file = elem[0].files[0];
                    fileObject.filetype = file.type;
                    fileObject.filename = file.name;
                    fileObject.filesize = file.size;
                    fileObject.isNew = true;
                    reader.readAsArrayBuffer(file);
                    if (fileObject.filetype == "image/png" || fileObject.filetype == "image/jpeg" || fileObject.filetype == "image/jpg") {
                        scope.validImage = true;
                        console.log("Image is valid");

                    } else {
                        console.log("Image is not Valid");
                        scope.validImage = false;
                    }
                });

                //http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
                function _arrayBufferToBase64(buffer) {
                    var binary = '';
                    var bytes = new Uint8Array(buffer);
                    var len = bytes.byteLength;
                    for (var i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    return $window.btoa(binary);
                }
            }
        };
    }])