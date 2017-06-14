function createMixin (execlib) {
  'use strict';

  var lib = execlib.lib;

  function VariableLengthHRFMixin (headerparsers, footerparsers) {
    this.headerparsers = headerparsers;
    this.footerparsers = footerparsers;
    this.headercnt = 0;
    this.footercnt = 0;
  };
  VariableLengthHRFMixin.prototype.destroy = function () {
    this.footercnt = null;
    this.headercnt = null;
    if (this.headerparsers) {
      lib.arryDestroyAll(this.headerparsers);
    }
    this.footerparsers = null;
    if (this.footerparsers) {
      lib.arryDestroyAll(this.footerparsers);
    }
    this.footerparsers = null;
  };

  VariableLengthHRFMixin.prototype.augmentBuffer = function (pending, data) {
    var ret;
    if (!this.tryParseHeader(data)) {
      if (!this.tryParseFooter(data)) {
        console.log('not header, not footer?', data);
        this.augmentBufferSuper(pending, data);
      }
    }
  };

  VariableLengthHRFMixin.prototype.tryParseHeader = function (data) {
    var hp;
    if (!(lib.isArray(this.headerparsers) && this.headerparsers.length)) {
      return false;
    }
    hp = this.headerparsers[0];
    if (hp.isNewRecord(data)) {
      this.onHeader(hp.createBuffer(data), this.headercnt);
      this.headercnt++;
      hp.destroy();
      this.headerparsers.shift();
      return true;
    }
  };

  VariableLengthHRFMixin.prototype.tryParseFooter = function (data) {
    var fp;
    if (!(lib.isArray(this.footerparsers) && this.footerparsers.length)) {
      return false;
    }
    fp = this.footerparsers[0];
    if (fp.isNewRecord(data)) {
      this.onFooter(fp.createBuffer(data), this.footercnt);
      this.footercnt++;
      fp.destroy();
      this.footerparsers.shift();
      return true;
    }
  };

  VariableLengthHRFMixin.addMethods = function (klass) {
    klass.prototype.augmentBufferSuper = klass.prototype.augmentBuffer;
    klass.prototype.finalizeSuper = klass.prototype.finalize;
    lib.inheritMethods(klass, VariableLengthHRFMixin,
      'augmentBuffer',
      'tryParseHeader',
      'tryParseFooter'
    );
  }
  return VariableLengthHRFMixin;
}

module.exports = createMixin;
