/*
* @Author: liujiajun1993
* @Date:   2016-08-25 17:30:57
*/

'use strict';
var $ = require('jQuery');

/**
 * 分页模块
 * @param  {Object}   option        配置参数
 * 其中
 * @param  {Function} changeHandler 必填，页码更换的响应函数。接受一个参数，更换后的页码值
 * @param  {String}   wrapper       必填，外包元素的selector，应该为一个div元素
 * @param  {Number}   pageNumber    总的分页数，默认值为0
 * @param  {Number}   middlePage    中间显示多少页（除去第1页和最后一页），多余的页数将被折叠并使用...代替，默认为10，最小为2
 */
var pageModule = function(option){
   this.pageNumber = option.pageNumber || 0;
   this.changeHandler = option.changeHandler;
   this.$wrapper = $(option.wrapper);
   this.$ul = $('<ul class="personal-management-pagelist">');
   this.middlePage = (option.middlePage && option.middlePage >= 2) ? option.middlePage :　10;

   this._init();
   this._bindEvent();
};

/** 对外接口，改变总页数 */
pageModule.prototype.changePageNumber = function(newPageNumber){
   if(typeof newPageNumber !== 'number')
      return;
   this.pageNumber = newPageNumber;
   this._init();
};

/**
 * 对外接口，覆盖默认的渲染函数
 * @param  {Function} textFunction 新的render字符串生成函数
 * 
 * textFunction接受一个object参数，分别为绘制所需的所有数据，包括
 * @param {Number} middleStart   除了1和最后一页，未折叠页码的起始页
 * @param {Number} middleEnd 未折叠页码的终止页
 * @param {Number} pageNumber 总的页数
 * @param {Number} currentPage 当前的选中的页码（需高亮的页）
 *
 * textFunction返回一个字符串，或者jQuery对象
 * 返回内容将直接append到wrapper容器
 */
pageModule.prototype.render = function(textFunction){
   this._renderContent = textFunction;
}

/**
 * 对外接口，返回当前页码
 * @return {Number} 当前页码
 */
pageModule.prototype.getCurrentIndex = function(){
   return this.currentPage;
}

/** 对外接口，将选中页码重置为1 */
pageModule.prototype.setInit = function(){
   this.currentPage = 1;
};

/** 对外接口，强制重绘page组件 */
pageModule.prototype.forceRepaint = function(){
   this._render();
};

/**
 * 初始化和重置函数
 */
pageModule.prototype._init = function(){
   this.currentPage = this.middleStart = this.middleEnd = 1;
   this._render();
};

/**
 * 向外层容器添加委托监听函数
 */
pageModule.prototype._bindEvent = function(){
   this.$wrapper.on('click', 'li', $.proxy(this._clickPage, this));
};

/**
 * 计算未折叠页码的起始范围和终止范围
 */
pageModule.prototype._calculate = function(){
   var before = parseInt(Math.floor(this.middlePage / 2), 10), // 前面预留的页数
       after = this.middlePage - 1 - before,  // 后面预留的页数
       currentIndex = this.currentPage,
       pageNumber = this.pageNumber,
       middlePage = this.middlePage;
   if(currentIndex <= before + 2){
      this.middleStart = 2;
      this.middleEnd = (middlePage + 1) < pageNumber - 1 ? middlePage + 1 : pageNumber - 1;
   }
   else if(currentIndex >= pageNumber - after - 1){
      this.middleEnd = pageNumber -1;
      this.middleStart = (pageNumber - middlePage) < 2 ? (pageNumber - middlePage) : 2;
      return;
   }
   else{
      this.middleStart = currentIndex - before;
      this.middleEnd = currentIndex + after;
   }
};

/**
 * 实际绘制函数
 * 考虑到兼容性因此写成jQuery字符串拼接，可以通过render接口替换成其他模板
 * @return {String/Object} 返回内容字符串或jQuery对象
 */
pageModule.prototype._renderContent = function(option){
   this.$ul.empty();

   var tempLi,
       middleStart = option.middleStart,
       middleEnd = option.middleEnd,
       currentPage = option.currentPage,
       pageNumber = option.pageNumber;
   if(pageNumber < 2){
      return;
   }
   tempLi = $('<li class="page-pre">&lt;</li>');
   if(currentPage === 1){
      tempLi.addClass('page-disabled');
   }
   this.$ul.append(tempLi);
   tempLi = $('<li class="page-number">1</li>');
   if(currentPage === 1){
      tempLi.addClass('page-current');
   }
   this.$ul.append(tempLi);
   if(middleStart > 2){
      this.$ul.append('<li class="page-more">...</li>');
   }
   if(middleStart <= middleEnd){
      for(var i =middleStart; i <= middleEnd; i++){
         tempLi = $('<li class="page-number">').text(i);
         if(currentPage === i){
            tempLi.addClass('page-current');
         }
         this.$ul.append(tempLi);
      }
   }
   if(middleEnd < pageNumber - 1){
      this.$ul.append('<li class="page-more">...</li>');
   }
   tempLi = $('<li class="page-number">').text(pageNumber);
   if(currentPage === pageNumber){
      tempLi.addClass('page-current');
   }
   this.$ul.append(tempLi);
   tempLi = $('<li class="page-next">&gt;</li>');
   if(currentPage >= pageNumber ){
      tempLi.addClass('page-disabled');
   }
   this.$ul.append(tempLi);
   return this.$ul;
};

/**
 * 向外包元素中加入页码
 * @param {Number} pageNumber 页码数
 */
pageModule.prototype._render = function(){
   // 先清空原来的状态
   this.$wrapper.empty();

   var pageNumber = this.pageNumber;
   if(pageNumber <= 1){
      return;
   }

   // 重新计算start和end
   this._calculate();

   // 绘制
   var content = this._renderContent({
      middleStart: this.middleStart,
      middleEnd: this.middleEnd,
      currentPage: this.currentPage,
      pageNumber: this.pageNumber
   });
   if(content == null){
      return;
   }
   this.$wrapper.append(content);
};

/**
 * 点击向前按钮
 */
pageModule.prototype._prePage = function(){
   if(this.currentPage <= 1){
      return;
   }
   this.currentPage --;
};

/**
 * 点击向后按钮
 */
pageModule.prototype._nextPage = function(){
   if(this.currentPage >= this.pageNumber){
      return;
   }
   this.currentPage ++;
};

/**
 * 点击页码或者向前、向后按钮
 */
pageModule.prototype._clickPage = function(event){
   var $target = $(event.target);
   if($target.hasClass('page-more') || $target.hasClass('page-disabled')){
      return;
   }
   if($target.hasClass('page-pre')){
      this._prePage();
   }
   else if($target.hasClass('page-next')){
      this._nextPage();
   }
   else{
      var currentNumber = parseInt($target.text(), 10);
      this.currentPage = currentNumber;
   }
   this._render();
   this.changeHandler(this.currentPage);
}

module.exports = pageModule;