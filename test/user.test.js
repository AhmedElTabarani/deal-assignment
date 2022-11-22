const chai = require('chai');
const chaiHTTP = require('chai-http');
const User = require('../models/user.model');

let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

describe('User Operations', async () => {
  before(async () => {
    server = await server;
    await User.deleteMany({});
    // admin = await User.create({
    //   name: 'admin',
    //   email: 'admin@dealapp.com',
    //   password: '123456',
    //   role: 'ADMIN',
    // });
  });

  describe('User signup', () => {
    it('should success to signup a user', (done) => {
      const user = {
        name: 'ahmed',
        email: 'ahmed@deal.com',
        password: '123456',
      };
      chai
        .request(server)
        .post('/api/users/signup')
        .send(user)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(201);
          body.should.have.keys(['status', 'data', 'token']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.keys([
            '_id',
            'name',
            'password',
            'email',
            'role',
          ]);
          body.data.name.should.be.a('string').eql('ahmed');
          body.data.email.should.be.a('string').eql('ahmed@deal.com');
          body.data.role.should.be.a('string').eql('USER');
          body.token.should.be.a('string');
          done();
        });
    });
    it('should fail to signup a user', (done) => {
      const user = {
        name: 'ahmed',
        email: 'ahmed@deal.com',
        password: '123456',
      };
      chai
        .request(server)
        .post('/api/users/signup')
        .send(user)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(409);
          body.should.include.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('Duplicate field value: email');
          done();
        });
    });
  });

  describe('User login', () => {
    it('should success to login a user', (done) => {
      const user = {
        name: 'ahmed',
        email: 'ahmed@deal.com',
        password: '123456',
      };
      chai
        .request(server)
        .post('/api/users/login')
        .send(user)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.keys(['status', 'data', 'token']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.keys([
            '_id',
            'name',
            'password',
            'email',
            'role',
          ]);
          body.data.name.should.be.a('string').eql('ahmed');
          body.data.email.should.be.a('string').eql('ahmed@deal.com');
          body.data.role.should.be.a('string').eql('USER');
          body.token.should.be.a('string');
          done();
        });
    });
    it('should fail to login a user', (done) => {
      const user = {
        name: 'ahmed',
        email: 'ahmed@deal.com',
        password: '123456789',
      };
      chai
        .request(server)
        .post('/api/users/login')
        .send(user)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(401);
          body.should.include.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('Email or password not correct');
          done();
        });
    });
  });
});
