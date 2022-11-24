const chai = require('chai');
const chaiHTTP = require('chai-http');
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
const testAdmin = {
  name: 'admin',
  email: 'admin@deal.com',
  password: 'deal123',
  role: 'ADMIN',
};
const testPost = {
  title: 'post',
  body: 'body',
};

describe('> Post Operation', () => {
  before(async () => {
    server = await server;
  });
  afterEach(() => {
    return Promise.all([Post.deleteMany({}), User.deleteMany({})]);
  });
  describe('> Create a post', () => {
    it('should normal user can create a post', (done) => {
      User.create(testUser).then((user) => {
        chai
          .request(server)
          .post('/api/users/login')
          .send(testUser)
          .end((err, res) => {
            user.token = res.body.token;
            chai
              .request(server)
              .post('/api/posts')
              .set('authorization', 'Bearer ' + user.token)
              .send(testPost)
              .end((err, res) => {
                const body = res.body;
                res.should.have.status(201);
                body.should.have.all.keys(['status', 'data']);
                body.status.should.be.a('string').eql('success');
                body.data.should.include.all.keys([
                  '_id',
                  'title',
                  'body',
                  'status',
                  'createdBy',
                ]);
                body.data.title.should.be
                  .a('string')
                  .eql(testPost.title);
                body.data.body.should.be
                  .a('string')
                  .eql(testPost.body);
                body.data.status.should.be.a('string').eql('PENDING');
                body.data.createdBy.should.be
                  .an('string')
                  .eql(user.id);

                done();
              });
          });
      });
    });
    it("should admin can't create a post", (done) => {
      User.create(testAdmin).then((user) => {
        chai
          .request(server)
          .post('/api/users/login')
          .send(testAdmin)
          .end((err, res) => {
            user.token = res.body.token;
            chai
              .request(server)
              .post('/api/posts')
              .set('authorization', 'Bearer ' + user.token)
              .send(testPost)
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
  describe('> Admin approve and reject a post', () => {
    beforeEach(() => {
      return Promise.all([
        User.create(testUser),
        User.create(testAdmin),
      ]);
    });
    it('should admin can approve a post', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testAdmin)
        .end((err, res) => {
          const admin = res.body.data;
          admin.token = res.body.token;
          chai
            .request(server)
            .post('/api/users/login')
            .send(testUser)
            .end((err, res) => {
              const user = res.body.data;
              user.token = res.body.token;
              Post.create({
                ...testPost,
                createdBy: user.id,
              }).then((post) => {
                chai
                  .request(server)
                  .patch('/api/posts/approve/' + post.id)
                  .set('authorization', 'Bearer ' + admin.token)
                  .end((err, res) => {
                    const body = res.body;
                    res.should.have.status(200);
                    body.should.have.all.keys(['status', 'data']);
                    body.status.should.be.a('string').eql('success');
                    body.data.should.include.all.keys([
                      '_id',
                      'title',
                      'body',
                      'status',
                      'createdBy',
                    ]);
                    body.data.title.should.be
                      .a('string')
                      .eql(post.title);
                    body.data.body.should.be
                      .a('string')
                      .eql(post.body);
                    body.data.status.should.be
                      .a('string')
                      .eql('APPROVED');

                    body.data.createdBy.id.should.be
                      .a('string')
                      .eql(user.id);
                    done();
                  });
              });
            });
        });
    });
    it("should user can't approve a post", (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          chai
            .request(server)
            .post('/api/posts')
            .set('authorization', 'Bearer ' + user.token)
            .send(testPost)
            .end((err, res) => {
              const post = res.body.data;
              chai
                .request(server)
                .patch('/api/posts/reject/' + post.id)
                .set('authorization', 'Bearer ' + user.token)
                .end((err, res) => {
                  const body = res.body;
                  res.should.have.status(403);
                  body.should.include.all.keys(['status', 'message']);
                  body.status.should.be.a('string').eql('fail');
                  body.message.should.be
                    .a('string')
                    .eql(
                      'You are not allow to perform this operation'
                    );
                  done();
                });
            });
        });
    });
    it('should admin can reject a post', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testAdmin)
        .end((err, res) => {
          const admin = res.body.data;
          admin.token = res.body.token;
          chai
            .request(server)
            .post('/api/users/login')
            .send(testUser)
            .end((err, res) => {
              const user = res.body.data;
              user.token = res.body.token;
              Post.create({
                ...testPost,
                createdBy: user.id,
              }).then((post) => {
                chai
                  .request(server)
                  .patch('/api/posts/reject/' + post.id)
                  .set('authorization', 'Bearer ' + admin.token)
                  .end((err, res) => {
                    const body = res.body;
                    res.should.have.status(200);
                    body.should.have.all.keys(['status', 'data']);
                    body.status.should.be.a('string').eql('success');
                    body.data.should.include.all.keys([
                      '_id',
                      'title',
                      'body',
                      'status',
                      'createdBy',
                    ]);
                    body.data.title.should.be
                      .a('string')
                      .eql(post.title);
                    body.data.body.should.be
                      .a('string')
                      .eql(post.body);
                    body.data.status.should.be
                      .a('string')
                      .eql('REJECTED');

                    body.data.createdBy.id.should.be
                      .a('string')
                      .eql(user.id);
                    done();
                  });
              });
            });
        });
    });
    it("should user can't reject a post", (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          chai
            .request(server)
            .post('/api/posts')
            .set('authorization', 'Bearer ' + user.token)
            .send(testPost)
            .end((err, res) => {
              const post = res.body.data;
              chai
                .request(server)
                .patch('/api/posts/reject/' + post.id)
                .set('authorization', 'Bearer ' + user.token)
                .end((err, res) => {
                  const body = res.body;
                  res.should.have.status(403);
                  body.should.include.all.keys(['status', 'message']);
                  body.status.should.be.a('string').eql('fail');
                  body.message.should.be
                    .a('string')
                    .eql(
                      'You are not allow to perform this operation'
                    );
                  done();
                });
            });
        });
    });
  });
  describe('> Get all post', () => {
    beforeEach(() => {
      return Promise.all([
        User.create(testUser),
        User.create(testAdmin),
      ]);
    });
    it('should get all posts without specific query', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          Post.create({
            ...testPost,
            createdBy: user.id,
            status: 'APPROVED',
          }).then((post1) => {
            Post.create({
              ...testPost,
              createdBy: user.id,
            }).then((post2) => {
              chai
                .request(server)
                .post('/api/users/login')
                .send(testAdmin)
                .end((err, res) => {
                  const admin = res.body.data;
                  admin.token = res.body.token;
                  chai
                    .request(server)
                    .get('/api/posts/')
                    .set('authorization', 'Bearer ' + admin.token)
                    .end((err, res) => {
                      const body = res.body;
                      res.should.have.status(200);
                      body.should.have.all.keys([
                        'status',
                        'data',
                        'total',
                        'page',
                        'limit',
                        'totalPages',
                        'hasNextPage',
                        'hasPrevPage',
                      ]);
                      body.status.should.be
                        .a('string')
                        .eql('success');
                      body.total.should.be.a('number').eql(2);
                      body.page.should.be.a('number').eql(1);
                      body.limit.should.be.a('number').eql(10);
                      body.totalPages.should.be.a('number').eql(1);
                      body.hasNextPage.should.be.a('boolean').to.be
                        .false;
                      body.hasPrevPage.should.be.a('boolean').to.be
                        .false;
                      body.data.should.be
                        .an('array')
                        .that.have.length(2);

                      body.data.forEach((post) => {
                        post.should.be
                          .an('object')
                          .that.include.all.keys([
                            '_id',
                            'title',
                            'body',
                            'status',
                            'createdBy',
                          ]);
                      });
                      const _page1 = body.data[0];
                      _page1.title.should.be
                        .a('string')
                        .eql(post1.title);
                      _page1.body.should.be
                        .a('string')
                        .eql(post1.body);
                      _page1.status.should.be
                        .a('string')
                        .eql('APPROVED');

                      const _page2 = body.data[1];
                      _page2.title.should.be
                        .a('string')
                        .eql(post2.title);
                      _page2.body.should.be
                        .a('string')
                        .eql(post2.body);
                      _page2.status.should.be
                        .a('string')
                        .eql('PENDING');

                      done();
                    });
                });
            });
          });
        });
    });
    it('should get all posts with specific query', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          Post.create({
            ...testPost,
            createdBy: user.id,
            status: 'APPROVED',
          }).then((post1) => {
            Post.create({
              ...testPost,
              createdBy: user.id,
            }).then((post2) => {
              chai
                .request(server)
                .post('/api/users/login')
                .send(testAdmin)
                .end((err, res) => {
                  const admin = res.body.data;
                  admin.token = res.body.token;
                  chai
                    .request(server)
                    .get('/api/posts?limit=1&page=2')
                    .set('authorization', 'Bearer ' + admin.token)
                    .end((err, res) => {
                      const body = res.body;
                      res.should.have.status(200);
                      body.should.have.all.keys([
                        'status',
                        'data',
                        'total',
                        'page',
                        'limit',
                        'totalPages',
                        'hasNextPage',
                        'hasPrevPage',
                      ]);
                      body.status.should.be
                        .a('string')
                        .eql('success');
                      body.total.should.be.a('number').eql(2);
                      body.page.should.be.a('number').eql(2);
                      body.limit.should.be.a('number').eql(1);
                      body.totalPages.should.be.a('number').eql(2);
                      body.hasNextPage.should.be.a('boolean').to.be
                        .false;
                      body.hasPrevPage.should.be.a('boolean').to.be
                        .true;
                      body.data.should.be
                        .an('array')
                        .that.have.length(1);

                      const _post = body.data[0];
                      _post.should.be
                        .an('object')
                        .that.include.all.keys([
                          '_id',
                          'title',
                          'body',
                          'status',
                          'createdBy',
                        ]);
                      _post.title.should.be
                        .a('string')
                        .eql(post2.title);
                      _post.body.should.be
                        .a('string')
                        .eql(post2.body);
                      _post.status.should.be
                        .a('string')
                        .eql('PENDING');
                      done();
                    });
                });
            });
          });
        });
    });
    it('should for user to get approved posts only', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(testUser)
        .end((err, res) => {
          const user = res.body.data;
          user.token = res.body.token;
          Post.create({
            ...testPost,
            createdBy: user.id,
            status: 'APPROVED',
          }).then((post1) => {
            Post.create({
              ...testPost,
              createdBy: user.id,
            }).then((post2) => {
              chai
                .request(server)
                .get('/api/posts')
                .set('authorization', 'Bearer ' + user.token)
                .end((err, res) => {
                  const body = res.body;
                  res.should.have.status(200);
                  body.should.have.all.keys([
                    'status',
                    'data',
                    'total',
                    'page',
                    'limit',
                    'totalPages',
                    'hasNextPage',
                    'hasPrevPage',
                  ]);
                  body.status.should.be.a('string').eql('success');
                  body.total.should.be.a('number').eql(1);
                  body.page.should.be.a('number').eql(1);
                  body.limit.should.be.a('number').eql(10);
                  body.totalPages.should.be.a('number').eql(1);
                  body.hasNextPage.should.be.a('boolean').to.be.false;
                  body.hasPrevPage.should.be.a('boolean').to.be.false;
                  body.data.should.be.an('array').that.have.length(1);

                  const _post = body.data[0];
                  _post.should.be
                    .an('object')
                    .that.include.all.keys([
                      '_id',
                      'title',
                      'body',
                      'status',
                      'createdBy',
                    ]);
                  _post.title.should.be.a('string').eql(post1.title);
                  _post.body.should.be.a('string').eql(post1.body);
                  _post.status.should.be.a('string').eql('APPROVED');
                  done();
                });
            });
          });
        });
    });
  });
});
