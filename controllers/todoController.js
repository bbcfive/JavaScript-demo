var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false});

var mongoose = require('mongoose');

mongoose.connect('mongodb://bbcfive:bbc123@ds037047.mlab.com:37047/todolistdatabase');

var todoSchema = new mongoose.Schema({
    item: String
});

var Todo = mongoose.model('Todo', todoSchema);

/* var todoOne = Todo({item: 'buy flowers'}).save(function(err){
    if (err) throw err;
    console.log('saved');
});

var data = [ {item: 'get milk'}, {item: 'walk dog'}, {item: 'kick some coding ass'} ]; */

module.exports = function(app) {
    app.get('/todo', function(req, res) {
        Todo.find({}, function(err, data) {
            if (err) throw err;
            res.render('todo', { todos : data});
        });
    });

    app.post('/todo', urlencodedParser, function(req, res) {
        var todoOne = Todo(req.body).save(function(err, data){
            if (err) throw err;
            res.json(data);
        });            
/*         data.push(req.body);
        res.json(data); */
    });

    app.delete('/todo/:item', function(req, res) {
/*         data = data.filter(function (todoItem) {
            return todoItem.item.replace(/ /g, '-') != req.params.item;
        }); */
        Todo.find({item: req.params.item.replace(/-/g, ' ')}).remove(function(err, data){
            if (err) throw err;
            res.json(data);
        });
    });
}