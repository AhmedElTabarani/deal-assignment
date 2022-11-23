const chai = require('chai');
const chaiHTTP = require('chai-http');
const User = require('../models/user.model');

let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

describe('> User Operations', async () => {
  let admin; // to use it to test operations that restrictTo ADMIN ONLY
  let user; // to use it to test operations that restrictTo USER ONLY

  before(async () => {
    server = await server;
    await User.deleteMany({});

    admin = await User.create({
      name: 'admin',
      email: 'admin@deal.com',
      password: 'deal123',
      // we can't use /api/users/signup
      // because 'role' didn't allow (default is 'USER')
      role: 'ADMIN',
    });
  });

  describe('> User signup', () => {
    it('should success to signup a user', (done) => {
      const testUser = {
        name: 'user',
        email: 'user@deal.com',
        password: '123456',
      };
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
      const testUser = {
        name: 'user',
        email: 'user@deal.com',
        password: '123456',
      };
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

  describe('> User login', () => {
    it('should success to login as a user', (done) => {
      const testUser = {
        email: 'user@deal.com',
        password: '123456',
      };
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const body = res.body;

          // get user data & token
          user = body.data;
          user.token = body.token;

          res.should.have.status(200);
          body.should.have.all.keys(['status', 'data', 'token']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'name',
            'email',
            'role',
          ]);
          body.data.name.should.be.a('string').eql('user');
          body.data.email.should.be.a('string').eql(testUser.email);
          body.data.role.should.be.a('string').eql('USER');
          body.token.should.be.a('string');
          done();
        });
    });
    it('should fail to login as a user', (done) => {
      const testUser = {
        email: 'ahmed@deal.com',
        password: '123456789',
      };
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
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

    // login as admin to get a token
    it('should success to login as an admin', (done) => {
      const testUser = {
        email: 'admin@deal.com',
        password: 'deal123',
      };
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const body = res.body;

          // get the token
          admin.token = body.token;

          res.should.have.status(200);
          body.should.have.all.keys(['status', 'data', 'token']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'name',
            'email',
            'role',
          ]);
          body.data.name.should.be.a('string').eql('admin');
          body.data.email.should.be.a('string').eql(testUser.email);
          body.data.role.should.be.a('string').eql('ADMIN');
          body.token.should.be.a('string');
          done();
        });
    });
    it('should fail to login as an admin', (done) => {
      const testUser = {
        email: 'admin@deal.com',
        password: 'dealapp123',
      };
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
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
  describe('> Authorization', async () => {
    it('should success to be a valid admin token', (done) => {
      chai
        .request(server)
        .get('/api/users/')
        .set('authorization', 'Bearer ' + admin.token)
        .end((err, res) => {
          res.should.have.status(200);
          done();
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
  describe('> Operation as admin ONLY', async () => {
    it('should success to get all users', (done) => {
      chai
        .request(server)
        .get('/api/users/')
        .set('authorization', 'Bearer ' + admin.token)
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
          _admin.name.should.be.a('string').eql('admin');
          _admin.email.should.be.a('string').eql('admin@deal.com');
          _admin.role.should.be.a('string').eql('ADMIN');

          const _user = body.data[1];
          _user.name.should.be.a('string').eql('user');
          _user.email.should.be.a('string').eql('user@deal.com');
          _user.role.should.be.a('string').eql('USER');

          done();
        });
    });
    it('should fail to get all users', (done) => {
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
