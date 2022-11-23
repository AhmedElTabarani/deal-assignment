require('./interaction.test');
const chai = require('chai');
const chaiHTTP = require('chai-http');
let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

describe('> Interaction Operation', () => {
  let admin;
  let user;
  before(async () => {
    server = await server;
  });

  describe('> Login user and admin to test operation', async () => {
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
    it('should success to login a admin', (done) => {
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

          // get data of normal admin
          admin = body.data;
          admin.token = body.token;

          res.should.have.status(200);
          body.data.email.should.be.a('string').eql(testUser.email);
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
  });
  describe('> Get statistics', () => {
    it('should get statistics', (done) => {
      chai
        .request(server)
        .get('/api/admin/statistics/')
        .set('authorization', 'Bearer ' + admin.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.all.keys(['status', 'data']);
          body.data.should.be
            .an('object')
            .that.have.all.keys([
              'totalNumberOfPosts',
              'totalNumberOfPendingPosts',
              'totalNumberOfApprovedPosts',
              'totalNumberOfRejectedPosts',
              'totalNumberOfCommentsOnPosts',
              'totalNumberOfInteractionsOnPostsAndComments',
              'totalNumberOfInteractionsOnPosts',
              'totalNumberOfInteractionsOnComments',
            ]);

          const data = body.data;
          data.totalNumberOfPosts.should.be.a('number').eql(2);
          data.totalNumberOfPendingPosts.should.be.a('number').eql(1);
          data.totalNumberOfApprovedPosts.should.be
            .a('number')
            .eql(1);
          data.totalNumberOfRejectedPosts.should.be
            .a('number')
            .eql(0);
          data.totalNumberOfCommentsOnPosts.should.be
            .a('number')
            .eql(1);
          data.totalNumberOfInteractionsOnPostsAndComments.should.be
            .a('number')
            .eql(2);
          data.totalNumberOfInteractionsOnPosts.should.be
            .a('number')
            .eql(1);
          data.totalNumberOfInteractionsOnComments.should.be
            .a('number')
            .eql(1);
          done();
        });
    });
    it('should fail to get statistics', (done) => {
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
