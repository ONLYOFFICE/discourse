import I18n from "I18n";
import { Promise } from "rsvp";
import QuickAccessItem from "discourse/widgets/quick-access-item";
import QuickAccessPanel from "discourse/widgets/quick-access-panel";
import { createWidgetFrom } from "discourse/widgets/widget";

const _extraItems = [];

export function addQuickAccessProfileItem(item) {
  _extraItems.push(item);
}

createWidgetFrom(QuickAccessItem, "logout-item", {
  tagName: "li.logout",

  html() {
    return this.attach("flat-button", {
      action: "logout",
      content: I18n.t("user.log_out"),
      icon: "oo-logout16",
      label: "user.log_out",
    });
  },
});

createWidgetFrom(QuickAccessPanel, "quick-access-profile", {
  tagName: "div.quick-access-panel.quick-access-profile",

  buildKey: () => "quick-access-profile",

  hideBottomItems() {
    // Never show the button to the full profile page.
    return true;
  },

  findNewItems() {
    return Promise.resolve(this._getItems());
  },

  itemHtml(item) {
    const widgetType = item.widget || "quick-access-item";
    return this.attach(widgetType, item);
  },

  _getItems() {
    let items = this._getDefaultItems();
    if (this._showToggleAnonymousButton()) {
      items.push(this._toggleAnonymousButton());
    }
    items = items.concat(_extraItems);

    if (this.attrs.showLogoutButton) {
      items.push({ widget: "logout-item" });
    }
    return items;
  },

  _getDefaultItems() {
    let defaultItems = [
      {
        icon: "oo-person16-icon",
        href: `${this.attrs.path}/summary`,
        content: I18n.t("user.summary.title"),
        className: "summary",
      },
      {
        icon: "oo-activity16-icon",
        href: `${this.attrs.path}/activity`,
        content: I18n.t("user.activity_stream"),
        className: "activity",
      },
    ];

    if (this.currentUser.can_invite_to_forum) {
      defaultItems.push({
        icon: "oo-invite16-icon",
        href: `${this.attrs.path}/invited`,
        content: I18n.t("user.invited.title"),
        className: "invites",
      });
    }

    defaultItems.push(
      {
        icon: "oo-wiki16-icon",
        href: `${this.attrs.path}/activity/drafts`,
        content: I18n.t("user_action_groups.15"),
        className: "drafts",
      },
      {
        icon: "oo-settings16",
        href: `${this.attrs.path}/preferences`,
        content: I18n.t("user.preferences"),
        className: "preferences",
      }
    );
    defaultItems.push({ widget: "do-not-disturb" });

    return defaultItems;
  },

  _toggleAnonymousButton() {
    if (this.currentUser.is_anonymous) {
      return {
        action: "toggleAnonymous",
        className: "disable-anonymous",
        content: I18n.t("switch_from_anon"),
        icon: "ban",
      };
    } else {
      return {
        action: "toggleAnonymous",
        className: "enable-anonymous",
        content: I18n.t("switch_to_anon"),
        icon: "user-secret",
      };
    }
  },

  _showToggleAnonymousButton() {
    return (
      (this.siteSettings.allow_anonymous_posting &&
        this.currentUser.trust_level >=
          this.siteSettings.anonymous_posting_min_trust_level) ||
      this.currentUser.is_anonymous
    );
  },
});
