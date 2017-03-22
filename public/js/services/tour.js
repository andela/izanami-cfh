angular.module('mean.system')
  .factory('gameTour', [() => {
    /**
     * Class to implement Game tour functionality
     */
    class GameTour {

      /**
       * Constructor to create a new instance of GameTour class
       */
      constructor() {
        // Initialize Shepherd tour
        this.tour = new Shepherd.Tour({
          defaults: {
            classes: 'shepherd-theme-default',
            scrollTo: true
          }
        });
      }

      /**
       * Method to start game tour
       * @return{undefined}
       */
      startTour() {
        this.tour.addStep('Step 1', {
          title: 'Start the game',
          text: `This button starts the game but a minimum of 3 players
      is required to start the game`,
          attachTo: '#start-game-container bottom',
          classes: 'shepherd-theme-default',
          showCancelLink: true,
          buttons: [
            {
              text: 'Skip',
              action: this.tour.cancel,
              classes: 'close-tour'
            },
            {
              text: 'Next',
              action: this.tour.next
            }
          ]
        });
        this.tour.addStep('Step 2', {
          title: 'Number of players',
          text: `Here is an indicator of how many players have
     joined the game out of 12 maximum players allowed.`,
          attachTo: '#player-count-container bottom',
          showCancelLink: true,
          buttons: [
            {
              text: 'Skip',
              action: this.tour.cancel,
              classes: 'close-tour'
            },
            {
              text: 'Back',
              action: this.tour.back,
            },
            {
              text: 'Next',
              action: this.tour.next,
            }
          ]
        });
        this.tour.addStep('Step 3', {
          title: 'Game Timer',
          text: `This is a countdown timer that shows how much
       time is remaining for you to choose a card.`,
          attachTo: '#timer-container left',
          showCancelLink: true,
          buttons: [
            {
              text: 'Skip',
              action: this.tour.cancel,
              classes: 'close-tour'
            },
            {
              text: 'Back',
              action: this.tour.back,
            },
            {
              text: 'Next',
              action: this.tour.next,
            }
          ]
        });
        this.tour.addStep('Step 4', {
          title: 'Abandon Game',
          text: 'Click this button to Leave the game.',
          attachTo: '#abandon-game-button bottom',
          showCancelLink: true,
          buttons: [
            {
              text: 'Back',
              action: this.tour.back,
            },
            {
              text: 'Done',
              action: this.tour.complete,
              classes: 'close-tour'
            }
          ]
        });
        this.tour.start();
      }

      /**
       * Method cancel game tour
       * @return{undefined}
       */
      cancelTour() {
        this.tour.cancel();
      }
    }

    return new GameTour();
  }]);
