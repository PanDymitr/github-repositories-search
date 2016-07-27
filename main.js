'use strict';

(function($) {

    const CONST = {
        per_page: 10, // number of repos per page
        initial_page: 1
    };

    var SearchRequestModel = Backbone.Model.extend({

        defaults: {
            requestExample: 'test-generator'
        }

    });

    var searchRequest = new SearchRequestModel();

    var SearchBoxView = Backbone.View.extend({
        id: 'search-box',

        model: searchRequest,

        searchBoxTpl: _.template( $('#search-box-tpl').html() ),

        events: {
            "submit form": "action"
        },

        initialize: function () {
            _.bindAll(this, "action", "render");
            this.render();
        },

        render: function () {
            this.$el.html(this.searchBoxTpl({requestExample: this.model.get('requestExample')}));
            return this;
        },

        action: function (e) {
            e.preventDefault();
            var requestParam = $('#repo-name').val();

            if(_.isEmpty(requestParam)) {
                alert('Enter repo name!');
            } else {
                app_router.navigate('search/' + requestParam + '/page/' + CONST.initial_page, true);
            }
        }
    });

    var Repo = Backbone.Model.extend();

    var RepoCollection = Backbone.Collection.extend({

        model: Repo,

        initialize: function(options){
            this.url = 'https://api.github.com/search/repositories?page=' + options.page + '&q=' + options.query + '&per_page=' + CONST.per_page ;
        }

    });

    var SearchResultView = Backbone.View.extend({
        id: 'js-searchResults',

        searchResultsTpl: _.template( $('#search-results-tpl').html() ),

        currentPage: 1,

        initialize: function (options) {
            _.bindAll(this, "render", "fetchSuccess", "fetchError");

            this.collection = new RepoCollection(options);

            this.collection.fetch({
                success: this.fetchSuccess,
                error: this.fetchError,
                reset: true
            });

            this.currentPage = parseInt(options.page);

            this.render({
                preloader: true,
                data: false,
                page: this.currentPage
            });
        },

        render: function (options) {
            this.$el.html(this.searchResultsTpl(options));
            return this;
        },

        fetchSuccess: function (collection, response, options) {

            this.collection.set(response.items);

            this.render({
                preloader: false,
                data: response.items,
                page: this.currentPage
            });
        },

        fetchError: function (collection, response, options) {
            throw new Error("Repo's fetch error", response);
        },

    });

    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "index",
            "search/:query/page/:page": "getRepo",
            "*path": "index"
        }
    });

    // Instantiate the router
    var app_router = new AppRouter;

    app_router.on('route:getRepo', function (query, page) {
        var resultsRoute = new SearchResultView({
            query: query,
            page: page
        });

        $("#content").html(resultsRoute.el);
    });

    app_router.on('route:index', function () {
        var indexRoute = new SearchBoxView();
        $("#content").html(indexRoute.el);
    });

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();

})(jQuery);
