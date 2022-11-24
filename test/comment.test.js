const chai = require('chai');
const chaiHTTP = require('chai-http');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
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

describe.only('> Comment Operation', () => {
  before(async () => {
    server = await server;
    await Comment.deleteMany({});
  });
  afterEach(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
  });
  describe('> Create a comment', () => {
    beforeEach(() => {
      return User.create(testUser);
    });
    it('should user can create a comment', (done) => {
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
                  body.data.body.should.be
                    .a('string')
                    .eql(testComment.body);
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
          Post.create({ ...testPost, createdBy: user.id }).then(
            (post) => {
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
            }
          );
        });
    });
  });
});
