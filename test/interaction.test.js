const chai = require('chai');
const chaiHTTP = require('chai-http');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const Interaction = require('../models/interaction.model');
let server = require('../server');

chai.use(chaiHTTP);

const should = chai.should();

const testUser = {
  name: 'user',
  email: 'user@deal.com',
  password: '123456',
};
const testComment = {
  body: 'body',
};
const testPost = {
  title: 'post',
  body: 'body',
};
const testInteraction = {
  type: 'ANGRY',
};

describe('> Interaction Operation', () => {
  before(async () => {
    server = await server;
  });
  afterEach(() => {
    return Promise.all([
      Comment.deleteMany({}),
      Post.deleteMany({}),
      User.deleteMany({}),
      Interaction.deleteMany({}),
    ]);
  });
  beforeEach(() => {
    return User.create(testUser);
  });
  describe('> Interact on a post', () => {
    it('should user can interact on a post', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          Post.create({ ...testPost, createdBy: user.id }).then(
            (post) => {
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
                  body.data.createdBy.should.be
                    .an('string')
                    .eql(user.id);

                  done();
                });
            }
          );
        });
    });
    it('should be no post with this id', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
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
  });
  describe('> Interact on a comment', () => {
    it('should user can interact on a comment', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          Post.create({ ...testPost, createdBy: user.id }).then(
            (post) => {
              Comment.create({
                ...testComment,
                post: post.id,
                createdBy: user.id,
              }).then((comment) => {
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
                    body.data.comment.should.be
                      .a('string')
                      .eql(comment.id);
                    body.data.createdBy.should.be
                      .an('string')
                      .eql(user.id);

                    done();
                  });
              });
            }
          );
        });
    });
    it('should be no comment with this id', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
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
  });
  describe('> Get all Interactions', () => {
    it('should get all interactions', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          Post.create({ ...testPost, createdBy: user.id }).then(
            (post) => {
              Comment.create({
                ...testComment,
                post: post.id,
                createdBy: user.id,
              }).then((comment) => {
                Promise.all([
                  Interaction.create({
                    type: 'ANGRY',
                    createdBy: user.id,
                    post: post.id,
                  }),
                  Interaction.create({
                    type: 'SAD',
                    createdBy: user.id,
                    comment: comment.id,
                  }),
                ]).then(() => {
                  chai
                    .request(server)
                    .get('/api/interactions/')
                    .set('authorization', 'Bearer ' + user.token)
                    .end((err, res) => {
                      const body = res.body;
                      res.should.have.status(200);
                      body.should.have.all.keys(['status', 'data']);
                      body.status.should.be
                        .a('string')
                        .eql('success');
                      body.data.should.be
                        .an('array')
                        .that.have.length(2);

                      body.data.forEach((interact) => {
                        interact.should.be
                          .an('object')
                          .that.include.all.keys([
                            '_id',
                            'type',
                            'createdBy',
                          ])
                          .and.include.any.keys(['post', 'comment']);
                      });
                      const _interact1 = body.data[0];
                      _interact1.type.should.be
                        .a('string')
                        .eql('ANGRY');
                      _interact1.post.should.be
                        .a('string')
                        .eql(post.id);

                      const _interact2 = body.data[1];
                      _interact2.type.should.be
                        .a('string')
                        .eql('SAD');
                      _interact2.comment.should.be
                        .a('string')
                        .eql(comment.id);

                      done();
                    });
                });
              });
            }
          );
        });
    });
  });
});
