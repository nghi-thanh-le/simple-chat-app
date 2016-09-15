var app = angular.module('chatApp', ['btford.socket-io', 'toastr', 'ui.bootstrap']);

app.factory('socket', function(socketFactory) {
    return socketFactory();
});

app.controller('MainCtrl', function($scope, socket, $http, toastr, $uibModal) {
    $scope.userArray = [];
    $scope.messageArray = [];
    $scope.currentUser = "";
    $scope.chatMessage = '';

    $scope.open = function() {
        $uibModal.open({
            animation: true,
            templateUrl: 'changeNameContent.html',
            controller: 'changeNameCtrl',
            size: 'md',
            resolve: {
                oldName: function () {
                    return angular.copy($scope.currentUser);
                }
            }
        });
    }

    socket.emit('new user', {});

    $scope.sendMessage = function() {
        socket.emit('send message', $scope.chatMessage);
        $scope.chatMessage = '';
    }

    socket.on('get users', function(data) {
        $scope.userArray = data;
    });

    socket.on('new message', function(data) {
        $scope.messageArray.push({
            user: data.user,
            message: data.message
        });
    });

    socket.forward('welcome', $scope);
    $scope.$on('socket:welcome', function (ev, data) {
        toastr.success('You are in the chat room as ' + data);
        $scope.currentUser = data;
    });

    socket.on('goodbye', function(data) {
        toastr.info(data + ' has left the room!!');
    });

    socket.on('userName changed', function(data) {
        toastr.info(data.oldName + ' has been changed to ' + data.newName);
    });
});

app.controller('changeNameCtrl', function($scope, $uibModalInstance, oldName, socket) {
    $scope.ok = function() {
        socket.emit('change userName', {
            oldName: oldName,
            newName: $scope.newName
        }, function () {
            $uibModalInstance.close();
        });
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});
