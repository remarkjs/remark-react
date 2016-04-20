var React = require('react'),
    remark = require('remark'),
    reactRenderer = require('remark-react');

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
                {remark().use(reactRenderer).process(this.state.text)}
            </div>
        </div>);
    }
});

React.render(<App />, document.getElementById('app'));
