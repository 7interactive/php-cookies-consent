class CookiesConsent {
    constructor(langCode, configPath) {
        this.instance = this;

        if (configPath) {
            this.configPath = configPath;
        } else {
            this.configPath = "./config/config.json";
        }

        this.configuration = this.loadConfiguration();

        if (langCode) {
            this.defaultLang = langCode;
        } else {
            this.defaultLang = this.configuration.global.defaultLang;
        }

        this.generatedHtml = this.generateCCModalHtml();
        this.allCookiesLevels = this.getAllCookiesLevels();
        this.setCookieLevels = Cookies.getCookie('CookieConsent');
        this.handleLink = "?do=sentCookieConsent";
    }

    loadConfiguration() {
        var configuration = null;
        $.ajax({
            url: this.configPath,
            async: false,
            dataType: 'json',
            success: function (response) {
                configuration = response;
            }
        });
        return configuration;
    }

    init() {
        if (!this.setCookieLevels) {
            this.appendCCModal();
            this.showCCModal();
        } else if (this.setCookieLevels) {
            CookiesConsent.allowScripts(this.setCookieLevels);
        }

        this.setReopenListener();
    }

    setReopenListener() {
        const instance = this.instance;
        $('.__cc_open').click(function (event) {
            instance.showCCModal();
        });
    }

    setHandleLink(url) {
        this.handleLink = url;
    }

    showCCModal() {
        if (!$('#__cookieConsent').length) {
            this.appendCCModal();
        }

        $('#__cookieConsent').show();
        this.setListeners();
    }

    generateCCModalHtml() {
        let translation = this.getTranslation();
        let html = $('<div id="__cookieConsent"><div id="__cookieConsent_dialog"><div class="__cookieConsent_header"></div><div class="__cookieConsent_description"><span></span><button id="__cookieConsent_btn_setting"></button></div><div class="__cookieConsent_buttons"><button id="__cookieConsent_btn_denied"></button><button id="__cookieConsent_btn_approved"></button></div></div></div>');
        html.find('.__cookieConsent_header').html(translation.headline);
        html.find('.__cookieConsent_description span').html(translation.description);
        html.find('#__cookieConsent_btn_setting').html(translation.settingButtonAnchor);
        html.find('#__cookieConsent_btn_denied').html(translation.buttonDenied);
        html.find('#__cookieConsent_btn_approved').html(translation.buttonApproved);

        return html;
    }

    getTranslation() {
        var translations = this.configuration.translations;
        return translations[this.defaultLang];
    }

    appendCCModal() {
        $("body").append(this.generatedHtml);
    }

    setListeners() {
        const instance = this.instance;
        $('#__cookieConsent_btn_setting').click(function (event) {
            event.preventDefault();
            instance.onButtonSetting();
        });

        $('#__cookieConsent_btn_denied').click(function (event) {
            event.preventDefault();
            instance.onButtonDenied();
        });

        $('#__cookieConsent_btn_approved').click(function (event) {
            event.preventDefault();
            instance.onButtonApproved();
        });
    }

    onButtonApproved() {
        let levels = Object.keys(this.allCookiesLevels)
        Cookies.setCookie(levels, 356);
        CookiesConsent.allowScripts(levels);
        CookiesConsent.destroy();

        this.saveConsent(levels);
    };

    onButtonDenied() {
        var levels = this.getNecessarilyCookies();
        Cookies.setCookie(levels, 356);
        CookiesConsent.allowScripts(levels);
        CookiesConsent.destroy();
    }

    onButtonSetting() {
        const cookiesSetting = new CookiesSetting();
        cookiesSetting.show();
    }

    getAllCookiesLevels() {
        return this.configuration.global.levels;
    }

    getNecessarilyCookies() {
        var necessarilyCookies = [];

        $.each(this.getAllCookiesLevels(), function (index, el) {
            if (el) {
                necessarilyCookies.push(index);
            }
        });

        return necessarilyCookies;
    }

    saveConsent(categories) {
        const handlerLink = this.handleLink;
        $.ajax({
            url: handlerLink,
            method: "POST",
            data: {categories: categories},
            success: function (response) {}
        });
    }

    static allowScripts(categories) {
        if (categories) {
            $.each(categories, function (index, el) {
                $.each($('[data-cc_category="' + el + '"]'), function (index, el) {
                    rebuildElement(el);
                });
            });
        }

        function rebuildElement(el) {
            el.setAttribute('type', 'text/javascript');
            el.removeAttribute('data-cc_category');

            let backUpSrc = el.src;
            el.src = '';
            el.src = backUpSrc;
        }
    }

    static hideCCModal() {
        $('#__cookieConsent').hide();
    }

    static destroy() {
        $('#__cookieConsent').remove();
    }
}

/**
 * Cookies
 **/
class Cookies {
    static getCookie(cookieName) {
        let cookie = {};

        document.cookie.split(';').forEach(function (el) {
            let [key, value] = el.split('=');
            cookie[key.trim()] = value;
        })

        if (cookie[cookieName] !== undefined) {
            return cookie[cookieName].split(',');
        } else {
            return false;
        }
    }

    static setCookie(data, expirateInDay) {
        const d = new Date();
        d.setTime(d.getTime() + (expirateInDay * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();

        document.cookie = 'CookieConsent' + "=" + data + ";" + expires + ";path=/";
    }
}


/**
 * CookiesSetting
 **/
class CookiesSetting extends CookiesConsent {
    constructor() {
        super();
        this.generatedSettingModalHtml = this.generatedSettingModalHtml();
    }

    show() {
        $('body').append(this.generatedSettingModalHtml);

        this.setListeners();
    }

    setListeners() {
        const instance = this;

        $('.__cookiesConsent_setting_fade,.__cookieConsentSetting_btn_close').click(function (event) {
            instance.destroy();
            event.preventDefault();
        });

        $('.__cookieConsentSetting_btn_save').click(function (event) {
            let levels = [];
            let selectedCategoriesEL = $('.__cookiesConsentSetting_category input[type="checkbox"]:checked');

            $.each(selectedCategoriesEL, function (index, el) {
                levels.push(el.name);
            });

            Cookies.setCookie(levels, 356);
            CookiesConsent.allowScripts(levels);
            CookiesConsent.destroy();

            instance.saveConsent(levels);
            instance.destroy();
            event.preventDefault();
        });
    }

    generatedSettingModalHtml() {
        let translation = this.getTranslation();

        let html = $('<div class="__cookiesConsent_setting_fade"></div><div id="__cookiesConsent_setting"><div class="__cookiesConsentSetting_dialog"><div class="__cookiesConsentSetting_headline"></div><div class="__cookiesConsentSetting_categories"></div><div id="__cookiesConsentSetting_butons"><button class="__cookieConsentSetting_btn_close">ZAVŘÍT</button><button class="__cookieConsentSetting_btn_save">ULOŽIT</button></div></div></div>');
        html.find('.__cookiesConsentSetting_headline').html(translation.settingHeadline);
        html.find('.__cookiesConsentSetting_categories').html(this.getCategoriesSectionHTML());

        return html;
    }

    getCategoriesSectionHTML() {
        const instance = this;
        let translation = this.getTranslation().levels;
        let html = '';

        $.each(this.getAllCookiesLevels(), function (index, el) {
            let checked = '';
            let disabledClass = '';

            if (el) {
                checked = 'checked';
                disabledClass = 'class="disabled"';
            }

            let category = '<div class="__cookiesConsentSetting_category"><label ' + disabledClass + '><input type="checkbox" name="' + index + '" ' + checked + '/>' + translation[index].name + '</label><p>' + translation[index].description + '</p>' + instance.getCookiesByCategory(index) + '</div>';

            html += category;
        });

        return html;
    }

    getCookiesByCategory(translationElement) {
        let translations = this.getTranslation().levels[translationElement].cookies;
        let trs = '';

        $.each(translations, function (index, el) {
            trs += '<tr><td>' + el.name + '</td><td>' + el.description + '</td></tr>';
        });

        return '<table>' + trs + '</table>';
    }

    destroy() {
        $('.__cookiesConsent_setting_fade').remove();
        $('#__cookiesConsent_setting').remove();
    }
}