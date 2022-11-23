require('./post.test');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

describe('> Comment Operation', () => {
  let user;
  let post;
  before(async () => {
    server = await server;
    await Comment.deleteMany({});
    post = await Post.findOne({});
  });

  describe('> Login user to test operation', async () => {
    describe('> Login as a user', () => {
      it('should success to login a user', (done) => {
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

            // get data of normal user
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
    });
  });
  describe('> Create a comment', () => {
    it('should user can create a comment', (done) => {
      const testComment = {
        body: 'ccc',
      };
      chai
        .request(server)
        .post('/api/comments/' + post.id)
        .set('authorization', 'Bearer ' + user.token)
        .send(testComment)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(201);
          body.should.have.all.keys(['status', 'data']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'body',
            'post',
            'createdBy',
          ]);
          body.data.body.should.be.a('string').eql(testComment.body);
          body.data.post.should.be.a('string').eql(post.id);
          body.data.createdBy.should.be.an('string').eql(user.id);

          done();
        });
    });
    it('should be no post with this id', (done) => {
      const testComment = {
        body: 'ccc',
      };
      chai
        .request(server)
        .post('/api/comments/' + user.id)
        .set('authorization', 'Bearer ' + user.token)
        .send(testComment)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(404);
          body.should.include.all.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('There is no post with that id');
          done();
        });
    });
  });
});
