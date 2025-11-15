import { useEffect } from "react";

import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

const pushToDataLayer = (event: string) => {
  const dataLayer = (window as any).dataLayer || [];
  dataLayer.push({ event });
};

const updateConsent = () => {
  pushToDataLayer("consent_update");
};

const initializeConsent = () => {
  updateConsent();
  setTimeout(() => {
    pushToDataLayer("consent_initial_selection");
  }, 500);
};

export function CookieBanner({
  language = "en",
  privacyPolicyUrl = "/privacy-policy",
}: {
  language?: string;
  privacyPolicyUrl?: string;
}) {
  useEffect(() => {
    CookieConsent.setLanguage(language);
    CookieConsent.run({
      onFirstConsent: initializeConsent,
      onChange: updateConsent,
      language: getLanguageConfig({ language, privacyPolicyUrl }),
      categories: {
        necessary: {
          readOnly: true,
        },
        functionality: {},
        analytics: {},
        marketing: {},
      },
    });
  }, [language, privacyPolicyUrl]);
    
  return null;
}

const getLanguageConfig = ({
  language,
  privacyPolicyUrl,
}: {
  language: string;
  privacyPolicyUrl: string;
}) => {
  return {
    default: language,
    translations: {
      en: {
        consentModal: {
          title: "We Value Your Privacy",
          description: `We use cookies to enhance your browsing experience, personalize ads or content, and analyze our traffic to improve user experience on our website. By clicking "Accept All", you consent to our use of cookies. For more info, see our <a href="${privacyPolicyUrl}">Privacy Policy</a>.`,
          acceptAllBtn: "Accept All",
          acceptNecessaryBtn: "Reject All",
          showPreferencesBtn: "Customize Settings",
        },
        preferencesModal: {
          title: "Privacy Preference Center",
          acceptAllBtn: "Accept All Cookies",
          acceptNecessaryBtn: "Reject All",
          savePreferencesBtn: "Save Preferences",
          closeIconLabel: "Close modal",
          serviceCounterLabel: "Service|Services",
          sections: [
            {
              title: "Cookie Usage",
              description:
                "When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device and is used to make the site work as you expect it to. The information does not directly identify you, but it can give you a more personalized web experience. Because we respect your right to privacy, you can choose not to allow some types of cookies. Click on the different category headings to find out more and change your default settings.",
            },
            {
              title:
                'Strictly Necessary Cookies <span class="pm__badge">Always Active</span>',
              description:
                "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences or filling in forms.",
              linkedCategory: "necessary",
            },
            {
              title: "Analytics Cookies",
              description:
                "These cookies allow us to track analytics by counting visits and traffic sources so we can measure and improve the performance of our website. They may be set by us or by third party providers to help us to know which pages are the most and least popular and see how visitors move around the website.",
              linkedCategory: "analytics",
            },
            {
              title: "Functionality Cookies",
              description:
                "These cookies enable the website to provide enhanced functionality and personalization based on your interaction with the website. They may be set by us or by third party providers whose services we have added to our pages.",
              linkedCategory: "functionality",
            },
            {
              title: "Advertisement Cookies",
              description:
                "These cookies may be set through our site by our advertising partners. They may be used by those partners to build a profile of your interests and show you relevant advertisements on other websites.",
              linkedCategory: "marketing",
            },
          ],
        },
      },
      zh: {
        consentModal: {
          title: "我们重视您的隐私",
          description: `我们使用 cookie 来增强您的浏览体验，提供个性化广告或内容，并分析我们的流量以改善网站用户体验。点击“接受所有”即表示您同意我们使用 cookie。有关更多信息，请参阅我们的<a href="${privacyPolicyUrl}">隐私政策</a>。`,
          acceptAllBtn: "接受所有",
          acceptNecessaryBtn: "拒绝所有",
          showPreferencesBtn: "自定义设置",
        },
        preferencesModal: {
          title: "隐私偏好中心",
          acceptAllBtn: "接受所有 cookie",
          acceptNecessaryBtn: "拒绝所有",
          savePreferencesBtn: "保存偏好",
          closeIconLabel: "关闭模态窗口",
          serviceCounterLabel: "服务",
          sections: [
            {
              title: "Cookie 使用",
              description:
                "当您访问任何网站时，它可能会在您的浏览器中存储或检索信息，主要以 cookie 的形式。这些信息可能是关于您、您的偏好或您的设备，并用于使网站按您的期望工作。这些信息并不直接识别您，但它可以为您提供更个性化的 Web 体验。因为我们尊重您的隐私权，您可以选择不允许某些类型的 cookie。单击不同的类别标题以了解更多信息并更改您的默认设置。",
            },
            {
              title:
                '严格必要的 Cookie <span class="pm__badge">始终活动</span>',
              description:
                "这些 cookie 对于网站的功能是必不可少的，不能在我们的系统中关闭。它们通常只是对您的操作做出的响应，这些操作相当于请求服务，例如设置您的隐私偏好或填写表单。",
              linkedCategory: "necessary",
            },
            {
              title: "分析 Cookie",
              description:
                "这些 cookie 允许我们通过计算访问量和流量来源来跟踪分析，以便我们可以衡量和改善我们网站的性能。它们可能是由我们设置的，也可能是由第三方提供商设置的，以帮助我们了解哪些页面最受欢迎，哪些页面最不受欢迎，并查看访问者在网站上的移动情况。",
              linkedCategory: "analytics",
            },
            {
              title: "功能性 Cookie",
              description:
                "这些 cookie 使网站能够根据您与网站的交互提供增强功能和个性化。它们可能是由我们设置的，也可能是由我们添加到我们页面的第三方提供商设置的。",
              linkedCategory: "functionality",
            },
            {
              title: "广告 Cookie",
              description:
                "这些 cookie 可能会通过我们的网站由我们的广告合作伙伴设置。它们可能会被这些合作伙伴用来建立您的兴趣概要，并在其他网站上向您显示相关广告。",
              linkedCategory: "marketing",
            },
          ],
        },
      },
    },
  };
};
