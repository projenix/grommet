'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('./utils');

var _Drag = require('../icons/base/Drag');

var _Drag2 = _interopRequireDefault(_Drag);

var _CSSClassnames = require('../../utils/CSSClassnames');

var _CSSClassnames2 = _interopRequireDefault(_CSSClassnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// (C) Copyright 2016 Hewlett Packard Enterprise Development LP

var CLASS_ROOT = _CSSClassnames2.default.CHART_RANGE;

// Allows selecting a region.
// Click to select one.
// Press and Drag to select multiple.
// Drag edges to adjust.

var Range = function (_Component) {
  (0, _inherits3.default)(Range, _Component);

  function Range() {
    (0, _classCallCheck3.default)(this, Range);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Range).call(this));

    _this._onMouseMove = _this._onMouseMove.bind(_this);
    _this._onMouseUp = _this._onMouseUp.bind(_this);
    _this.state = {};
    return _this;
  }

  (0, _createClass3.default)(Range, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var mouseDown = this.state.mouseDown;

      if (mouseDown) {
        window.removeEventListener('mouseup', this._onMouseUp);
      }
    }
  }, {
    key: '_valueToIndex',
    value: function _valueToIndex(value) {
      var _props = this.props;
      var count = _props.count;
      var vertical = _props.vertical;

      var rect = this.refs.range.getBoundingClientRect();
      var total = vertical ? rect.height : rect.width;
      return Math.round(value / total * (count - 1));
    }
  }, {
    key: '_percentForIndex',
    value: function _percentForIndex(index) {
      var count = this.props.count;

      return 100 / (count - 1) * Math.min(index, count - 1);
    }
  }, {
    key: '_mouseIndex',
    value: function _mouseIndex(event) {
      var _props2 = this.props;
      var active = _props2.active;
      var count = _props2.count;
      var vertical = _props2.vertical;
      var _state = this.state;
      var mouseDown = _state.mouseDown;
      var mouseDownIndex = _state.mouseDownIndex;

      var rect = this.refs.range.getBoundingClientRect();
      var value = vertical ? event.clientY - rect.top : event.clientX - rect.left;
      var index = this._valueToIndex(value);

      // constrain index to keep it within range as needed
      if ('active' === mouseDown && mouseDownIndex >= 0) {
        if (index > mouseDownIndex) {
          // moving right/down
          index = Math.min(mouseDownIndex + count - 1 - active.end, index);
        } else if (index < mouseDownIndex) {
          // moving up/left
          index = Math.max(mouseDownIndex - active.start, index);
        }
      } else if ('start' === mouseDown) {
        index = Math.min(active.end, index);
      } else if ('end' === mouseDown) {
        index = Math.max(active.start, index);
      }

      return index;
    }
  }, {
    key: '_mouseDown',
    value: function _mouseDown(source) {
      var _this2 = this;

      return function (event) {
        event.stopPropagation(); // so start and end don't trigger range
        var index = _this2._mouseIndex(event);
        _this2.setState({
          mouseDown: source,
          mouseDownIndex: index
        });
        window.addEventListener('mouseup', _this2._onMouseUp);
      };
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp(event) {
      window.removeEventListener('mouseup', this._onMouseUp);
      var _props3 = this.props;
      var active = _props3.active;
      var onActive = _props3.onActive;
      var _state2 = this.state;
      var mouseDown = _state2.mouseDown;
      var mouseDownIndex = _state2.mouseDownIndex;
      var moved = _state2.moved;

      var mouseUpIndex = this._mouseIndex(event);

      this.setState({
        mouseDown: false,
        mouseDownIndex: undefined,
        mouseMoveIndex: undefined,
        moved: false
      });

      if (onActive) {
        var nextActive = void 0;

        if ('range' === mouseDown) {
          if (moved) {
            nextActive = {
              start: Math.min(mouseDownIndex, mouseUpIndex),
              end: Math.max(mouseDownIndex, mouseUpIndex)
            };
          }
        } else if ('active' === mouseDown) {
          var delta = mouseUpIndex - mouseDownIndex;
          nextActive = {
            start: active.start + delta,
            end: active.end + delta
          };
        } else if ('start' === mouseDown) {
          nextActive = {
            start: mouseUpIndex,
            end: active.end
          };
        } else if ('end' === mouseDown) {
          nextActive = {
            start: active.start,
            end: mouseUpIndex
          };
        }

        onActive(nextActive);
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var mouseMoveIndex = this.state.mouseMoveIndex;

      var index = this._mouseIndex(event);
      if (index !== mouseMoveIndex) {
        this.setState({ mouseMoveIndex: index, moved: true });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props4 = this.props;
      var active = _props4.active;
      var count = _props4.count;
      var vertical = _props4.vertical;
      var _state3 = this.state;
      var mouseDown = _state3.mouseDown;
      var mouseDownIndex = _state3.mouseDownIndex;
      var mouseMoveIndex = _state3.mouseMoveIndex;


      var classes = [CLASS_ROOT];
      if (vertical) {
        classes.push(CLASS_ROOT + '--vertical');
      }
      if (mouseDown) {
        classes.push(CLASS_ROOT + '--dragging');
      }
      if (this.props.className) {
        classes.push(this.props.className);
      }

      var indicator = void 0;
      if (active || mouseDown) {

        var start = void 0,
            end = void 0;
        if ('range' === mouseDown) {
          start = Math.min(mouseDownIndex, mouseMoveIndex);
          end = Math.max(mouseDownIndex, mouseMoveIndex);
        } else if ('active' === mouseDown && mouseMoveIndex >= 0) {
          var delta = mouseMoveIndex - mouseDownIndex;
          start = active.start + delta;
          end = active.end + delta;
        } else if ('start' === mouseDown && mouseMoveIndex >= 0) {
          start = mouseMoveIndex;
          end = active.end;
        } else if ('end' === mouseDown && mouseMoveIndex >= 0) {
          start = active.start;
          end = mouseMoveIndex;
        } else {
          start = active.start;
          end = active.end;
        }
        // in case the user resizes the window
        start = Math.max(0, Math.min(count - 1, start));
        end = Math.max(0, Math.min(count - 1, end));

        var style = void 0;
        if (vertical) {
          style = {
            top: this._percentForIndex(start) + '%',
            height: this._percentForIndex(end - start) + '%'
          };
        } else {
          style = {
            marginLeft: this._percentForIndex(start) + '%',
            width: this._percentForIndex(end - start) + '%'
          };
        }

        indicator = _react2.default.createElement(
          'div',
          { className: CLASS_ROOT + '__active', style: style,
            onMouseDown: this._mouseDown('active') },
          _react2.default.createElement(
            'div',
            { className: CLASS_ROOT + '__active-start',
              onMouseDown: this._mouseDown('start') },
            _react2.default.createElement(_Drag2.default, null)
          ),
          _react2.default.createElement(
            'div',
            { className: CLASS_ROOT + '__active-end',
              onMouseDown: this._mouseDown('end') },
            _react2.default.createElement(_Drag2.default, null)
          )
        );
      }

      var onMouseMove = void 0;
      if (mouseDown) {
        onMouseMove = this._onMouseMove;
      }

      return _react2.default.createElement(
        'div',
        { ref: 'range', className: classes.join(' '),
          style: { padding: _utils.padding },
          onMouseDown: this._mouseDown('range'), onMouseMove: onMouseMove },
        indicator
      );
    }
  }]);
  return Range;
}(_react.Component);

Range.displayName = 'Range';
exports.default = Range;
;

Range.propTypes = {
  count: _react.PropTypes.number,
  active: _react.PropTypes.shape({
    end: _react.PropTypes.number.isRequired,
    start: _react.PropTypes.number.isRequired
  }),
  onActive: _react.PropTypes.func, // (start, end)
  vertical: _react.PropTypes.bool
};
module.exports = exports['default'];