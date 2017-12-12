/*
* @Author: bjliujiajun
* @Date:   2016-08-16 17:45:32
* @Last Modified by:   bjliujiajun
* @Last Modified time: 2016-09-18 17:56:37
* @使用方法，形如
*    new editableTags({ wrapper: '.personal-edition-tags', errorTip: '', maxLength: 64 });
*  其中wrapper为外层的div
*/

'use strict';
var $ = require('../../../lib/jquery.js');
var editableTags = function(option){
   this.$div = $(option.wrapper);
   this.$errorTip = $(option.errorTip);
   this.maxLength = option.maxLength;
   this.$ul = this.$div.find('ul');
   this.$input = this.$div.find('textarea');
   this.enable();
};

/**
 * 对外接口，清空input和ul
 */
editableTags.prototype.empty = function(){
   this.$ul.empty();
   this.$input.val('');
};

/**
 * 对外接口，允许编辑内容
 */
editableTags.prototype.enable = function(){
   this._bindEvent();
   this.$ul.find('li').removeClass('tags-disabled');
   this.$input.removeClass('hidden');
};

/**
 * 对外接口，允许编辑内容
 */
editableTags.prototype.disable = function(){
   this._unbindEvent();
   this.$ul.find('li').addClass('tags-disabled');
   this.$input.addClass('hidden');
};

/**
 * 对外接口，返回编辑内容
 * @return {Array} 编辑的内容组成的数组
 */
editableTags.prototype.getContent = function(){
   var content = [];
   var $li = this.$ul.find('li'),
       liLen = $li.length;
   for(var i = 0; i < liLen; i++){
      content.push($li.eq(i).text());
   }
   return content;
};

/**
 * 对外接口，设置现有编辑内容
 * @param {Array} content 要设置的内容
 */
editableTags.prototype.setContent = function(content){
   if(!content || content.length == null){
      return;
   }
   this.$ul.empty();
   for(var i = 0, len = content.length; i < len; i++){
      var temp = $.trim(content[i]);
      if(temp.length > 0){
         this.$ul.append($('<li>').text(content[i]));
      }
   }
};

/**
 * 对外接口，只显示标签或只显示输入框
 * @param  {String} content 要显示的内容
 */
editableTags.prototype.showSingle = function(content){
   switch(content){
      case 'input':
         this.$ul.addClass('hidden');
         this.$input.removeClass('hidden');
      default:
         this.$ul.removeClass('hidden');
         this.$input.addClass('hidden');
   }
}
/** 绑定事件 */
editableTags.prototype._bindEvent = function(){
   this.$div.on('click', $.proxy(this._clicked, this));
   this.$input.on('focus', $.proxy(this._inputFocus, this));
   this.$input.on('keyup', $.proxy(this._inputed, this));
   this.$input.on('blur', $.proxy(this._inputBlur, this));
   this.$ul.on('click', 'li', $.proxy(this._deleteTag, this));
};

/** 解绑事件 */
editableTags.prototype._unbindEvent = function(){
   this.$div.off('click', $.proxy(this._clicked, this));
   this.$input.off('focus', $.proxy(this._inputFocus, this));
   this.$input.off('blur', $.proxy(this._inputBlur, this));
   this.$input.off('keyup', $.proxy(this._inputed, this));
   this.$ul.off('click', 'li', $.proxy(this._deleteTag, this));
};

/* 点击外层div，input自动获得焦点 */
editableTags.prototype._clicked = function(){
   this.$input.focus();
};

/** input获得焦点，将标签删除，转化为input值 */
editableTags.prototype._inputFocus = function(event){
   this.$input.removeClass('hidden');
   if(this.$input.val().length <= 0){
      var content = this.getContent().join(' ');
      this.$ul.addClass('hidden');
      this.$input.val(content);
   }
};

/** input失去焦点，将其值全部转化为标签 */
editableTags.prototype._inputBlur = function(event){
   var content = this.$input.val().split(/[\s,;，；]/),
       i, currentLength;
   for(var i = 0, len = content.length; i < len; i++){
      currentLength = content[i].replace(/[^\x00-\xff]/g, '**').length;
      if(currentLength > this.maxLength){
         this.$errorTip.removeClass('hidden').text('标签过长，最多为32个汉字');
         this.$input.focus();
         return false;
      }
   }
   this.$errorTip.addClass('hidden');
   this.setContent(content);
   this.$ul.removeClass('hidden');
   this.$input.addClass('hidden').val('');
};

/** 用户输入回车，input失去焦点 */
editableTags.prototype._inputed = function(event){
   if(event.keyCode == 13){
      this.$div.blur();
      this.$input.blur();
   }
};

/** 用户点击标签，删除标签 */
editableTags.prototype._deleteTag = function(event){
   event.stopPropagation();
   $(event.target).remove();
};

module.exports = editableTags;