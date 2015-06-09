function FileExtension(extension, fileType, canIndex) {
    var self = this;
    self.extension = ko.observable(extension);
    self.fileType = ko.observable(fileType);
    self.canIndex = ko.observable(canIndex);
    self.newExtension = ko.observable(true);
    self.isSelected = ko.observable(false);
    self.errorHtml = ko.observable("");
    self.showError = ko.observable(false)
}