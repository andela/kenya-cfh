const should = require('should');
const io = require('socket.io-client');

const socketURL = 'http://localhost:3001';

const options = {
  transports: ['websocket'],
  'force new connection': true
};


describe('Game Server', () => {
  it('Should accept requests to joinGame', (done) => {
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', {
        userID: 'unauthenticated',
        room: '',
        createPrivate: false
      });
      setTimeout(disconnect, 200);
    });
  });

  it('Should send a game update upon receiving request to joinGame', (done) => {
    const client1 = io.connect(socketURL, options);
    const disconnect = () => {
      client1.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', {
        userID: 'unauthenticated',
        room: '',
        createPrivate: false
      });
      client1.on('gameUpdate', (data) => {
        data.gameID.should.match(/\d+/);
      });
      setTimeout(disconnect, 200);
    });
  });

  it('Should announce new user to all users', (done) => {
    const client1 = io.connect(socketURL, options);
    let client2;
    const disconnect = () => {
      client1.disconnect();
      client2.disconnect();
      done();
    };
    client1.on('connect', () => {
      client1.emit('joinGame', {
        userID: 'unauthenticated',
        room: '',
        createPrivate: false
      });
      client2 = io.connect(socketURL, options);
      client2.on('connect', () => {
        client2.emit('joinGame', {
          userID: 'unauthenticated',
          room: '',
          createPrivate: false
        });
        client1.on('notification', (data) => {
          data.notification.should.match(/ has joined the game\!/);
        });
      });
      setTimeout(disconnect, 200);
    });
  });

  it(
    'Should start game when startGame event is sent with 3 players',
    (done) => {
      let client2;
      let client3;

      const client1 = io.connect(socketURL, options);
      const disconnect = () => {
        client1.disconnect();
        client2.disconnect();
        client3.disconnect();
        done();
      };
      const expectStartGame = () => {
        client1.emit('startGame');
        client1.on('gameUpdate', (data) => {
          data.state.should.equal('czar pick card');
        });
        client2.on('gameUpdate', (data) => {
          data.state.should.equal('czar pick card');
        });
        client3.on('gameUpdate', (data) => {
          data.state.should.equal('czar pick card');
        });
        setTimeout(disconnect, 200);
      };
      client1.on('connect', () => {
        client1.emit(
          'joinGame',
          {
            userID: 'unauthenticated',
            room: '',
            createPrivate: false
          }
        );
        client2 = io.connect(socketURL, options);
        client2.on('connect', () => {
          client2.emit(
            'joinGame',
            {
              userID: 'unauthenticated',
              room: '',
              createPrivate: false
            }
          );
          client3 = io.connect(socketURL, options);
          client3.on('connect', () => {
            client3.emit(
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
