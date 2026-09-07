// import { Object3D, Vector3, Mesh, SphereGeometry, MeshBasicMaterial, BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, InstancedMesh } from 'three';

// function _arrayLikeToArray(arr:any, len?:number) {
//   if (len == null || len > arr.length) len = arr.length;

//   for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

//   return arr2;
// }

// function _arrayWithoutHoles(arr) {
//   if (Array.isArray(arr)) return _arrayLikeToArray(arr);
// }

// function _iterableToArray(iter) {
//   if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
// }

// function _unsupportedIterableToArray(o, minLen?:number) {
//   if (!o) return;
//   if (typeof o === "string") return _arrayLikeToArray(o, minLen);
//   var n = Object.prototype.toString.call(o).slice(8, -1);
//   if (n === "Object" && o.constructor) n = o.constructor.name;
//   if (n === "Map" || n === "Set") return Array.from(o);
//   if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
// }

// function _nonIterableSpread() {
//   throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
// }

// function _toConsumableArray(arr) {
//   return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
// }

// function _defineProperty(obj, key, value) {
//   if (key in obj) {
//     Object.defineProperty(obj, key, {
//       value: value,
//       enumerable: true,
//       configurable: true,
//       writable: true
//     });
//   } else {
//     obj[key] = value;
//   }

//   return obj;
// }

// function ownKeys(object, enumerableOnly?:boolean) {
//   var keys = Object.keys(object);

//   if (Object.getOwnPropertySymbols) {
//     var symbols = Object.getOwnPropertySymbols(object);
//     enumerableOnly && (symbols = symbols.filter(function (sym) {
//       return Object.getOwnPropertyDescriptor(object, sym).enumerable;
//     })), keys.push.apply(keys, symbols);
//   }

//   return keys;
// }

// function _objectSpread2(target,...args) {
//   for (var i = 1; i < arguments.length; i++) {
//     var source = null != arguments[i] ? arguments[i] : {};
//     i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
//       _defineProperty(target, key, source[key]);
//     }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
//       Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
//     });
//   }

//   return target;
// }

// function _defineProperties(target, props) {
//   for (var i = 0; i < props.length; i++) {
//     var descriptor = props[i];
//     descriptor.enumerable = descriptor.enumerable || false;
//     descriptor.configurable = true;
//     if ("value" in descriptor) descriptor.writable = true;
//     Object.defineProperty(target, descriptor.key, descriptor);
//   }
// }

// function _createClass(Constructor, protoProps, staticProps) {
//   if (protoProps) _defineProperties(Constructor.prototype, protoProps);
//   if (staticProps) _defineProperties(Constructor, staticProps);
//   Object.defineProperty(Constructor, "prototype", {
//     writable: false
//   });
//   return Constructor;
// }

// function _classCallCheck(instance, Constructor) {
//   if (!(instance instanceof Constructor)) {
//     throw new TypeError("Cannot call a class as a function");
//   }
// }

// function _assertThisInitialized(self) {
//   if (self === void 0) {
//     throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
//   }

//   return self;
// }

// function _setPrototypeOf(o, p) {
//   return Object.setPrototypeOf(o, p);
// }

// function _inherits(subClass, superClass) {
//   if (typeof superClass !== "function" && superClass !== null) {
//     throw new TypeError("Super expression must either be null or a function");
//   }

//   subClass.prototype = Object.create(superClass && superClass.prototype, {
//     constructor: {
//       value: subClass,
//       writable: true,
//       configurable: true
//     }
//   });
//   Object.defineProperty(subClass, "prototype", {
//     writable: false
//   });
//   if (superClass) _setPrototypeOf(subClass, superClass);
// }

// function _getPrototypeOf(o) {

//   return Object.getPrototypeOf(o);
// }

// function _isNativeReflectConstruct() {
//   if (typeof Reflect === "undefined" || !Reflect.construct) return false;
//   if (Reflect.construct.sham) return false;
//   if (typeof Proxy === "function") return true;

//   try {
//     Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
//     return true;
//   } catch (e) {
//     return false;
//   }
// }

// function _possibleConstructorReturn(self, call) {
//   if (call && (typeof call === "object" || typeof call === "function")) {
//     return call;
//   } else if (call !== void 0) {
//     throw new TypeError("Derived constructors may only return object or undefined");
//   }

//   return _assertThisInitialized(self);
// }

// function _createSuper(Derived) {
//   var hasNativeReflectConstruct = _isNativeReflectConstruct();
//   return function _createSuperInternal() {
//     var Super = _getPrototypeOf(Derived),
//         result;

//     if (hasNativeReflectConstruct) {
//       var NewTarget = _getPrototypeOf(this).constructor;
//       result = Reflect.construct(Super, arguments, NewTarget);
//     } else {
//       result = Super.apply(this, arguments);
//     }

//     return _possibleConstructorReturn(this, result);
//   };
// }

// var _o = new Object3D();

// var _v = new Vector3();

// var RaycasterHelper = /*#__PURE__*/function (_Object3D) {
//   _inherits(RaycasterHelper, _Object3D);

//   var _super = _createSuper(RaycasterHelper);

//   function RaycasterHelper(raycaster) {
//     var _this;

//     var numberOfHitsToVisualize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;

//     _classCallCheck(this, RaycasterHelper);

//     _this = _super.call(this);

//     _defineProperty(_assertThisInitialized(_this), "colors", {
//       near: 0xffffff,
//       far: 0xffffff,
//       originToNear: 0x333333,
//       nearToFar: 0xffffff,
//       origin: [0x0eec82, 0xff005b]
//     });

//     _defineProperty(_assertThisInitialized(_this), "setColors", function (colors) {
//       var _colors = _objectSpread2(_objectSpread2({}, _this.colors), colors);

//       _this.near.material.color.set(_colors.near);

//       _this.far.material.color.set(_colors.far);

//       _this.nearToFar.material.color.set(_colors.nearToFar);

//       _this.originToNear.material.color.set(_colors.originToNear);
//     });

//     _defineProperty(_assertThisInitialized(_this), "update", function () {
//       var origin = _this.raycaster.ray.origin;
//       var direction = _this.raycaster.ray.direction;

//       _this.origin.position.copy(origin);

//       _this.near.position.copy(origin).add(direction.clone().multiplyScalar(_this.raycaster.near));

//       _this.far.position.copy(origin).add(direction.clone().multiplyScalar(_this.raycaster.far));

//       _this.far.lookAt(origin);

//       _this.near.lookAt(origin);

//       var pos = _this.nearToFar.geometry.getAttribute("position"); // @ts-ignore


//       pos.set([].concat(_toConsumableArray(_this.near.position), _toConsumableArray(_this.far.position)));
//       pos.needsUpdate = true;
//       pos = _this.originToNear.geometry.getAttribute("position"); // @ts-ignore

//       pos.set([].concat(_toConsumableArray(origin), _toConsumableArray(_this.near.position)));
//       pos.needsUpdate = true;
//       /**
//        * Update hit points visualization
//        */

//       for (var i = 0; i < _this.numberOfHitsToVisualize; i++) {
//         var _this$hits;

//         var hit = (_this$hits = _this.hits) === null || _this$hits === void 0 ? void 0 : _this$hits[i];

//         if (hit) {
//           var point = hit.point;

//           _o.position.copy(point);

//           _o.scale.setScalar(1);
//         } else {
//           _o.scale.setScalar(0);
//         }

//         _o.updateMatrix();

//         _this.hitPoints.setMatrixAt(i, _o.matrix);
//       }

//       _this.hitPoints.instanceMatrix.needsUpdate = true;
//       /**
//        * Update the color of the origin based on wether there are hits.
//        */

//       _this.origin.material.color.set(_this.hits.length > 0 ? _this.colors.origin[0] : _this.colors.origin[1]);
//     });

//     _this.numberOfHitsToVisualize = numberOfHitsToVisualize;
//     _this.raycaster = raycaster;
//     _this.hits = [];
//     _this.origin = new Mesh(new SphereGeometry(0.04, 32), new MeshBasicMaterial());
//     _this.origin.name = "RaycasterHelper_origin";

//     _this.origin.raycast = function () {
//       return null;
//     };

//     var size = 0.1;
//     var geometry = new BufferGeometry(); // prettier-ignore

//     geometry.setAttribute('position', new Float32BufferAttribute([-size, size, 0, size, size, 0, size, -size, 0, -size, -size, 0, -size, size, 0], 3));
//     _this.near = new Line(geometry, new LineBasicMaterial());
//     _this.near.name = "RaycasterHelper_near";

//     _this.near.raycast = function () {
//       return null;
//     };

//     _this.far = new Line(geometry, new LineBasicMaterial());
//     _this.far.name = "RaycasterHelper_far";

//     _this.far.raycast = function () {
//       return null;
//     };

//     _this.nearToFar = new Line(new BufferGeometry(), new LineBasicMaterial());
//     _this.nearToFar.name = "RaycasterHelper_nearToFar";

//     _this.nearToFar.raycast = function () {
//       return null;
//     };

//     _this.nearToFar.geometry.setFromPoints([_v, _v]);

//     _this.originToNear = new Line(_this.nearToFar.geometry.clone(), new LineBasicMaterial());
//     _this.originToNear.name = "RaycasterHelper_originToNear";

//     _this.originToNear.raycast = function () {
//       return null;
//     };

//     _this.hitPoints = new InstancedMesh(new SphereGeometry(0.04), new MeshBasicMaterial(), _this.numberOfHitsToVisualize);
//     _this.hitPoints.name = "RaycasterHelper_hits";

//     _this.hitPoints.raycast = function () {
//       return null;
//     };

//     _this.add(_this.nearToFar);

//     _this.add(_this.originToNear);

//     _this.add(_this.near);

//     _this.add(_this.far);

//     _this.add(_this.origin);

//     _this.add(_this.hitPoints);

//     _this.setColors();

//     return _this;
//   }

//   return _createClass(RaycasterHelper);
// }(Object3D);

// export { RaycasterHelper };
