import {Component} from '@angular/core';
import {environment} from '../environments/environment';

declare const Parse: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title;
  todos;
  Todo;

  constructor() {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY);
    Parse.serverURL = environment.serverURL;
    Parse.liveQueryServerURL = environment.liveQueryServerURL;

    this.Todo = Parse.Object.extend('Todo');
    const query = new Parse.Query(this.Todo);
    query.ascending('createdAt').limit(5).find().then(todos => {
      this.todos = new Set(todos);
    }).catch(error => {
      alert('Failed to retrieving objects, with error code: ' + error.message);
    });

    const subscription = query.subscribe();
    subscription.on('create', todo => {
      this.todos.add(todo);
      console.log('On create event');
    });
    subscription.on('delete', todo => {
      this.todos.forEach(t => {
        if (t.id === todo.id) {
          console.log('On delete event');
          this.todos.delete(t);
        }
      });
    });
  }

  toggleCompleted = todo => {
    todo.set('completed', !todo.get('completed'));
    todo.save();
  }

  saveTodo = () => {
    if (this.title) {
      const todo = new this.Todo();
      todo.set('title', this.title);
      todo.save();
    }
    this.title = null;
  }

  clearCompleted = () => {
    this.todos.forEach(t => {
      if (t.get('completed')) {
        t.destroy();
      }
    });
  }

  clearAll = () => {
    this.todos.forEach(t => t.destroy());
  }
}

