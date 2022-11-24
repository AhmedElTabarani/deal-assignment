const chai = require('chai');
const chaiHTTP = require('chai-http');
const User = require('../models/user.model');

let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

const testUser = {
  name: 'user',
  email: 'user@deal.com',
  password: '123456',
};
const testAdmin = {
  name: 'admin',
  email: 'admin@deal.com',
  password: 'deal123',
  role: 'ADMIN',
};
describe('> User Operations', async () => {
  before(async () => {
    server = await server;
  });
  afterEach(async () => {
    await User.deleteMany({});
  });
  describe('> User signup', () => {
    it('should success to signup a user', (done) => {
      chai
        .request(server)
        .post('/api/users/signup')
        .send(testUser)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(201);
          body.should.have.all.keys(['status', 'data', 'token']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'name',
            'email',
            'role',
          ]);
          body.data.name.should.be.a('string').eql(testUser.name);
          body.data.email.should.be.a('string').eql(testUser.email);
          body.data.role.should.be.a('string').eql('USER');
          body.token.should.be.a('string');
          done();
        });
    });
    it('should fail to signup a user', (done) => {
      User.create(testUser).then(() => {
        chai
          .request(server)
          .post('/api/users/signup')
          .send(testUser)
          .end((err, res) => {
            const body = res.body;
            res.should.have.status(409);
            body.should.include.all.keys(['status', 'message']);
            body.status.should.be.a('string').eql('fail');
            body.message.should.be
              .a('string')
              .eql('Duplicate field value: email');
            done();
          });
      });
    });
  });

  describe('> User login', () => {
    it('should success to login as a user', (done) => {
      User.create(testUser).then(() => {
        chai
          .request(server)
          .post('/api/users/login')
          .send(testUser)
          .end((err, res) => {
            const body = res.body;
            res.should.have.status(200);
            body.should.have.all.keys(['status', 'data', 'token']);
            body.status.should.be.a('string').eql('success');
            body.data.should.include.all.keys([
              '_id',
              'name',
              'email',
              'role',
            ]);
            body.data.name.should.be.a('string').eql(testUser.name);
            body.data.email.should.be.a('string').eql(testUser.email);
            body.data.role.should.be.a('string').eql('USER');
            body.token.should.be.a('string');
            done();
          });
      });
    });

    it('should fail to login as a user', (done) => {
      User.create(testUser).then(() => {
        chai
          .request(server)
          .post('/api/users/login')
          .send({
            email: 'test@deal.com',
            password: '12345689',
          })
          .end((err, res) => {
            const body = res.body;
            res.should.have.status(401);
            body.should.include.all.keys(['status', 'message']);
            body.status.should.be.a('string').eql('fail');
            body.message.should.be
              .a('string')
              .eql('Email or password not correct');
            done();
          });
      });
    });
  });
  describe('> Admin login', () => {
    it('should success to login as an admin', (done) => {
      User.create(testAdmin).then(() => {
        chai
          .request(server)
          .post('/api/users/login')
          .send(testAdmin)
          .end((err, res) => {
            const body = res.body;
            res.should.have.status(200);
            body.should.have.all.keys(['status', 'data', 'token']);
            body.status.should.be.a('string').eql('success');
            body.data.should.include.all.keys([
              '_id',
              'name',
              'email',
              'role',
            ]);
            body.data.name.should.be.a('string').eql(testAdmin.name);
            body.data.email.should.be
              .a('string')
              .eql(testAdmin.email);
            body.data.role.should.be.a('string').eql('ADMIN');
            body.token.should.be.a('string');
            done();
          });
      });
    });

    it('should fail to login as an admin', (done) => {
      User.create(testAdmin).then(() => {
        chai
          .request(server)
          .post('/api/users/login')
          .send({
            email: 'admin@deal.com',
            password: 'deal123456',
          })
          .end((err, res) => {
            const body = res.body;
            res.should.have.status(401);
            body.should.include.all.keys(['status', 'message']);
            body.status.should.be.a('string').eql('fail');
            body.message.should.be
              .a('string')
              .eql('Email or password not correct');
            done();
          });
      });
    });
  });
  describe('> Authorization', () => {
    it('should success to be a valid admin token', (done) => {
      User.create(testAdmin).then((user) => {
        chai
          .request(server)
          .post('/api/users/login')
          .send(testAdmin)
          .end((err, res) => {
            user.token = res.body.token;
            chai
              .request(server)
              .get('/api/users/')
              .set('authorization', 'Bearer ' + user.token)
              .end((err, res) => {
                res.should.have.status(200);
                done();
              });
          });
      });
    });
    it("should be fail because it's Unauthorized user", (done) => {
      chai
        .request(server)
        .get('/api/users/')
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(401);
          body.should.include.all.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('Please login or signup');
          done();
        });
    });
    it("should be fail because it's invalid token", (done) => {
      chai
        .request(server)
        .get('/api/users/')
        .set('authorization', 'Bearer 1.1.1')
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(401);
          body.should.include.all.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be.a('string').eql('Invalid token');
          done();
        });
    });
  });
  describe('> Operation as admin ONLY', () => {
    it('should success to get all users', (done) => {
        User.create(testAdmin).then((user) => {
        chai
          .request(server)
          .post('/api/users/login')
          .send(testAdmin)
          .end((err, res) => {
            user.token = res.body.token;

            User.create(testUser).then(() => {
              chai
                .request(server)
                .get('/api/users/')
                .set('authorization', 'Bearer ' + user.token)
                .end((err, res) => {
                  const body = res.body;
                  res.should.have.status(200);
                  body.should.have.all.keys(['status', 'data']);
                  body.status.should.be.a('string').eql('success');
                  body.data.should.be.an('array').that.have.length(2);
                  body.data.forEach((user) => {
                    user.should.be
                      .an('object')
                      .that.include.all.keys([
                        '_id',
                        'name',
                        'email',
                        'role',
                      ]);
                  });
                  const _admin = body.data[0];
                  _admin.name.should.be
                    .a('string')
                    .eql(testAdmin.name);
                  _admin.email.should.be
                    .a('string')
                    .eql(testAdmin.email);
                  _admin.role.should.be.a('string').eql('ADMIN');

                  const _user = body.data[1];
                  _user.name.should.be.a('string').eql(testUser.name);
                  _user.email.should.be
                    .a('string')
                    .eql(testUser.email);
                  _user.role.should.be.a('string').eql('USER');

                  done();
                });
            });
          });
      });
    });
  });
  it('should fail to get all users', (done) => {
    User.create(testUser).then((user) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          user.token = res.body.token;
          chai
            .request(server)
            .get('/api/users/')
            .set('authorization', 'Bearer ' + user.token)
            .end((err, res) => {
              const body = res.body;
              res.should.have.status(403);
              body.should.include.all.keys(['status', 'message']);
              body.status.should.be.a('string').eql('fail');
              body.message.should.be
                .a('string')
                .eql('You are not allow to perform this operation');
              done();
            });
        });
    });
  });
});
