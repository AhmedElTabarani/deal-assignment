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
const testAdmin = {
  name: 'admin',
  email: 'admin@deal.com',
  password: 'deal123',
  role: 'ADMIN',
};
const testComment = {
  body: 'body',
};
const testPost = {
  title: 'post',
  body: 'body',
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
  describe('> Get statistics', () => {
    beforeEach(() => {
      return Promise.all([
        User.create(testUser),
        User.create(testAdmin),
      ]);
    });
    it('should get statistics', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testAdmin)
        .end((err, res) => {
          const admin = res.body.data;
          admin.token = res.body.token;
          Promise.all([
            Post.create({
              ...testPost,
              createdBy: admin.id,
              status: 'APPROVED',
            }),
            Post.create({ ...testPost, createdBy: admin.id }),
          ]).then(([post1, post2]) => {
            Promise.all([
              Comment.create({
                ...testComment,
                post: post1.id,
                createdBy: admin.id,
              }),
              Comment.create({
                ...testComment,
                post: post2.id,
                createdBy: admin.id,
              }),
            ]).then(([comment1, comment2]) => {
              Promise.all([
                Interaction.create({
                  type: 'ANGRY',
                  createdBy: admin.id,
                  post: post1.id,
                }),
                Interaction.create({
                  type: 'SAD',
                  createdBy: admin.id,
                  comment: comment1.id,
                }),
                Interaction.create({
                  type: 'ANGRY',
                  createdBy: admin.id,
                  post: post2.id,
                }),
                Interaction.create({
                  type: 'SAD',
                  createdBy: admin.id,
                  comment: comment2.id,
                }),
              ]).then(() => {
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
                    data.totalNumberOfPosts.should.be
                      .a('number')
                      .eql(2);
                    data.totalNumberOfPendingPosts.should.be
                      .a('number')
                      .eql(1);
                    data.totalNumberOfApprovedPosts.should.be
                      .a('number')
                      .eql(1);
                    data.totalNumberOfRejectedPosts.should.be
                      .a('number')
                      .eql(0);
                    data.totalNumberOfCommentsOnPosts.should.be
                      .a('number')
                      .eql(2);
                    data.totalNumberOfInteractionsOnPostsAndComments.should.be
                      .a('number')
                      .eql(4);
                    data.totalNumberOfInteractionsOnPosts.should.be
                      .a('number')
                      .eql(2);
                    data.totalNumberOfInteractionsOnComments.should.be
                      .a('number')
                      .eql(2);
                    done();
                  });
              });
            });
          });
        });
    });
    it('should fail to get statistics', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
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
  })
});
