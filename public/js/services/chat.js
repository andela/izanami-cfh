angular.module('mean.system')
  .factory('chat', [() => {
    /**
     * Class to implement chat functionality
     */
    class Chat {

      /**
       * Constructor to create a new instance of chat class
       */
      constructor() {
        // declare fire base reference with link to our firebase database
        // Initialize Firebase
        const config = {
          apiKey: 'AIzaSyCynnLlWRmN6LGNWNJ8suWJFdBe2dZ3ZNI',
          authDomain: 'izanami-39f9c.firebaseapp.com',
          databaseURL: 'https://izanami-39f9c.firebaseio.com',
          storageBucket: 'izanami-39f9c.appspot.com',
          messagingSenderId: '1099209555674'
        };
        firebase.initializeApp(config);
        this.database = firebase.database();
        this.messageArray = [];
        this.enableListener = true;
        this.showChatWindow = false;
        this.unreadMessageCount = 0;
      }

      /**
       * Method to set chat group to post messages to
       * @param {String} group
       * @return{undefined}
       */
      setChatGroup(group) {
        this.chatGroup = group;
      }

      /**
       * Method to set current chat user name
       * @param {String} name of user
       * @return{undefined}
       */
      setChatUsername(name) {
        this.userName = name;
      }

      /**
       * Method to post user messages to firebase
       * @param {String} messageText
       * @return{undefined}
       */
      postGroupMessage(messageText) {
        const date = new Date();
        const messageTime = date.toTimeString().substr(0, 8);
        // We do not want to send empty messages
        if (messageText !== undefined && messageText.trim().length > 0) {
          // Push message to group thread on firebase
          const messageObject = {
            senderName: this.userName,
            textContent: messageText,
            time: messageTime
          };
          this.database.ref(this.chatGroup)
            .push(messageObject);
        }
      }

      /**
       * Method to setup  eventlistener
       * for firebase
       * @return{undefined}
       */
      listenForMessages() {
        if (!this.enableListener) {
          return;
        }
        // this.database.ref(this.chatGroup).off();
        this.enableListener = false;
        // this.database.ref(this.chatGroup).on('child_added', (snapshot) => {
        this.database.ref(this.chatGroup).limit(1).on('child_added', (snapshot) => {
          const message = snapshot.val();
          this.messageArray.push(message);
          this.updateUnreadMessageCount();
        });
      }

      /**
       * Method updates unread message count
       * @return{undefined}
       */
      updateUnreadMessageCount() {
        if (!this.showChatWindow) {
          this.unreadMessageCount += 1;
        }
      }

    }
    return new Chat();
  }]);
