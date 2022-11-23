require('./comment.test');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const Interaction = require('../models/interaction.model');
let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

describe('> Interaction Operation', () => {
  let user;
  let post;
  let comment;
  before(async () => {
    server = await server;
    await Interaction.deleteMany({});
    post = await Post.findOne({});
    comment = await Comment.findOne({});
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
  describe('> Interact on a comment', () => {
    it('should user can interact on a comment', (done) => {
      const testInteraction = {
        type: 'ANGRY',
      };
      chai
        .request(server)
        .post('/api/interactions/comment/' + comment.id)
        .set('authorization', 'Bearer ' + user.token)
        .send(testInteraction)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(201);
          body.should.have.all.keys(['status', 'data']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'type',
            'comment',
            'createdBy',
          ]);
          body.data.type.should.be
            .a('string')
            .eql(testInteraction.type);
          body.data.comment.should.be.a('string').eql(comment.id);
          body.data.createdBy.should.be.an('string').eql(user.id);

          done();
        });
    });
    it('should be no comment with this id', (done) => {
      const testInteraction = {
        type: 'ANGRY',
      };
      chai
        .request(server)
        .post('/api/interactions/comment/' + user.id)
        .set('authorization', 'Bearer ' + user.token)
        .send(testInteraction)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(404);
          body.should.include.all.keys(['status', 'message']);
          body.status.should.be.a('string').eql('fail');
          body.message.should.be
            .a('string')
            .eql('There is no comment with that id');
          done();
        });
    });
  });
  describe('> Interact on a post', () => {
    it('should user can interact on a post', (done) => {
      const testInteraction = {
        type: 'SAD',
      };
      chai
        .request(server)
        .post('/api/interactions/post/' + post.id)
        .set('authorization', 'Bearer ' + user.token)
        .send(testInteraction)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(201);
          body.should.have.all.keys(['status', 'data']);
          body.status.should.be.a('string').eql('success');
          body.data.should.include.all.keys([
            '_id',
            'type',
            'post',
            'createdBy',
          ]);
          body.data.type.should.be
            .a('string')
            .eql(testInteraction.type);
          body.data.post.should.be.a('string').eql(post.id);
          body.data.createdBy.should.be.an('string').eql(user.id);

          done();
        });
    });
    it('should be no post with this id', (done) => {
      const testInteraction = {
        type: 'SAD',
      };
      chai
        .request(server)
        .post('/api/interactions/post/' + user.id)
        .set('authorization', 'Bearer ' + user.token)
        .send(testInteraction)
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
  describe('> Get all Interactions', () => {
    it('should get all interactions', (done) => {
      chai
        .request(server)
        .get('/api/interactions/')
        .set('authorization', 'Bearer ' + user.token)
        .end((err, res) => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.all.keys(['status', 'data']);
          body.status.should.be.a('string').eql('success');
          body.data.should.be.an('array').that.have.length(2);

          body.data.forEach((interact) => {
            interact.should.be
              .an('object')
              .that.include.all.keys(['_id', 'type', 'createdBy'])
              .and.include.any.keys(['post', 'comment']);
          });
          const _interact1 = body.data[0];
          _interact1.type.should.be.a('string').eql('ANGRY');
          _interact1.comment.should.be.a('string').eql(comment.id);

          const _interact2 = body.data[1];
          _interact2.type.should.be.a('string').eql('SAD');
          _interact2.post.should.be.a('string').eql(post.id);

          done();
        });
    });
  });
});
