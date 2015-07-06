var React = require('react'),
    mdast = require('mdast'),
    reactRenderer = require('mdast-react');

var App = React.createClass({
    getInitialState() {
        return { text: '# hello world' };
    },
    onChange(e) {
        this.setState({ text: e.target.value });
    },
    render() {
        return (<div>
            <textarea
                value={this.state.text}
                onChange={this.onChange} />
            <div id='preview'>
                {mdast().use(reactRenderer).process(this.state.text)}
            </div>
        </div>);
    }
});

React.render(<App />, document.getElementById('app'));
