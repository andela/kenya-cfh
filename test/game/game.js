const io = require('socket.io-client');

const socketURL = 'http://localhost:3001';

const options = {
  transports: ['websocket'],
  'force new connection': true
};


describe('Game Server', () => {
  it(
    'Should accept requests to join game when joinGame request is sent',
    (done) => {
      const client = io.connect(socketURL, options);
      const disconnect = () => {
        client.disconnect();
        done();
      };
      client.on('connect', () => {
        client.emit('joinGame', {
          userID: 'unauthenticated',
          room: '',
          createPrivate: false
        });
        setTimeout(disconnect, 200);
      });
    }
  );

  it('Should send a game update upon receiving request to joinGame', (done) => {
    const socket = io.connect(socketURL, options);
    const disconnect = () => {
      socket.disconnect();
      done();
    };
    socket.on('connect', () => {
      socket.emit('joinGame', {
        userID: 'unauthenticated',
        room: '',
        createPrivate: false
      });
      socket.on('gameUpdate', (response) => {
        response.gameID.should.match(/\d+/);
      });
      setTimeout(disconnect, 200);
    });
  });

  it('Should announce new user to all users', (done) => {
    const client = io.connect(socketURL, options);
    let socket;
    const disconnect = () => {
      client.disconnect();
      socket.disconnect();
      done();
    };
    client.on('connect', () => {
      client.emit('joinGame', {
        userID: 'unauthenticated',
        room: '',
        createPrivate: false
      });
      socket = io.connect(socketURL, options);
      socket.on('connect', () => {
        socket.emit('joinGame', {
          userID: 'unauthenticated',
          room: '',
          createPrivate: false
        });
        client.on('notification', (response) => {
          response.notification.should.match(/ has joined the game\!/);
        });
      });
      setTimeout(disconnect, 200);
    });
  });

  it(
    'Should start game when startGame event is sent with 3 players',
    (done) => {
      let client;
      let events;

      const socket = io.connect(socketURL, options);
      const disconnect = () => {
        socket.disconnect();
        client.disconnect();
        events.disconnect();
        done();
      };
      const expectStartGame = () => {
        socket.emit('startGame');
        socket.on('gameUpdate', (response) => {
          response.state.should.equal('czar pick card');
        });
        client.on('gameUpdate', (response) => {
          response.state.should.equal('czar pick card');
        });
        events.on('gameUpdate', (response) => {
          response.state.should.equal('czar pick card');
        });
        setTimeout(disconnect, 200);
      };
      socket.on('connect', () => {
        socket.emit(
          'joinGame',
          {
            userID: 'unauthenticated',
            room: '',
            createPrivate: false
          }
        );
        client = io.connect(socketURL, options);
        client.on('connect', () => {
          client.emit(
            'joinGame',
            {
              userID: 'unauthenticated',
              room: '',
              createPrivate: false
            }
          );
          events = io.connect(socketURL, options);
          events.on('connect', () => {
            events.emit(
              'joinGame',
              {
                userID: 'unauthenticated',
                room: '',
                createPrivate: false
              }
            );
            setTimeout(expectStartGame, 100);
          });
        });
      });
    }
  );
});
