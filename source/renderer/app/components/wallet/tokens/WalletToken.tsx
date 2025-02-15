import React, { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { Button } from 'react-polymorph/lib/components/Button';
import { PopOver } from 'react-polymorph/lib/components/PopOver';
import classNames from 'classnames';
import { get } from 'lodash';
import SVGInline from 'react-svg-inline';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module './WalletToken.scss' or its cor... Remove this comment to see the full error message
import styles from './WalletToken.scss';
import Asset from '../../assets/Asset';
import AssetAmount from '../../assets/AssetAmount';
import AssetContent from '../../assets/AssetContent';
import type { AssetToken } from '../../../api/assets/types';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../assets/images/collaps... Remove this comment to see the full error message
import arrow from '../../../assets/images/collapse-arrow-small.inline.svg';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../assets/images/asset-t... Remove this comment to see the full error message
import warningIcon from '../../../assets/images/asset-token-warning-ic.inline.svg';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../assets/images/star-no... Remove this comment to see the full error message
import starNotFilledIcon from '../../../assets/images/star-not-filled.inline.svg';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../assets/images/star-fi... Remove this comment to see the full error message
import starFilledIcon from '../../../assets/images/star-filled.inline.svg';

const messages = defineMessages({
  tokenSendButton: {
    id: 'wallet.summary.asset.tokenSendButton',
    defaultMessage: '!!!Send',
    description: 'Send button on Wallet summary assets page',
  },
  amountLabel: {
    id: 'wallet.summary.asset.amountLabel',
    defaultMessage: '!!!Amount',
    description: 'Amount label on Wallet summary assets page',
  },
  settingsButtonLabel: {
    id: 'wallet.summary.asset.settings.button.label',
    defaultMessage: '!!!Settings',
    description: 'Settings label on Wallet summary assets page',
  },
  settingsWarningPopOverAvailable: {
    id: 'assets.warning.available',
    defaultMessage:
      '!!!Recommended configuration for decimal places for this native token is available.',
    description: 'Asset settings recommended pop over content',
  },
  settingsWarningPopOverNotUsing: {
    id: 'assets.warning.notUsing',
    defaultMessage:
      '!!!You are not using the recommended decimal place configuration for this native token.',
    description: 'Asset settings recommended pop over content',
  },
});
type Props = {
  anyAssetWasHovered: boolean;
  asset: AssetToken;
  assetSettingsDialogWasOpened: boolean;
  intl: intlShape.isRequired;
  isFavorite: boolean;
  isInsertingAsset: boolean;
  isLoading: boolean;
  isRemovingAsset: boolean;
  onAssetSettings: (...args: Array<any>) => any;
  onCopyAssetParam: (...args: Array<any>) => any;
  onOpenAssetSend: (...args: Array<any>) => any;
  onToggleFavorite: (...args: Array<any>) => any;
};
type IsExpanded = boolean;
const WalletToken = observer((props: Props) => {
  const [isExpanded, setIsExpanded] = useState<IsExpanded>(false);
  const [arrowStyles, setArrowStyles] = useState<string | null>(null);

  const toggleIsExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const favoriteIconStyles = classNames([
    styles.favoriteIcon,
    props.isFavorite ? styles.isFavorite : null,
  ]);
  const {
    anyAssetWasHovered,
    asset,
    assetSettingsDialogWasOpened,
    intl,
    isFavorite,
    isLoading,
    onAssetSettings,
    onCopyAssetParam,
    onOpenAssetSend,
    onToggleFavorite,
  } = props;
  const assetHeaderContent = useMemo(() => {
    const { decimals, recommendedDecimals } = asset;
    const hasWarning =
      typeof recommendedDecimals === 'number' &&
      decimals !== recommendedDecimals;
    return (
      <>
        <Asset
          asset={asset}
          onCopyAssetParam={onCopyAssetParam}
          // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
          metadataNameChars={get('name', asset.metadata, 0)}
          assetSettingsDialogWasOpened={assetSettingsDialogWasOpened}
          anyAssetWasHovered={anyAssetWasHovered}
          className={styles.asset}
          hidePopOver
          fullFingerprint
          hasWarning={hasWarning}
        />
        <AssetAmount
          amount={asset.quantity}
          metadata={asset.metadata}
          decimals={asset.decimals}
          isLoading={isLoading}
          className={styles.assetAmount}
          isShort
        />
      </>
    );
  }, [
    anyAssetWasHovered,
    asset,
    assetSettingsDialogWasOpened,
    isFavorite,
    isLoading,
    onCopyAssetParam,
    onToggleFavorite,
  ]);
  useEffect(
    () =>
      setArrowStyles(
        classNames(styles.arrow, {
          [styles.isExpanded]: isExpanded,
        })
      ),
    [isExpanded]
  );
  const header = useMemo(() => {
    const { uniqueId } = asset;
    const starIcon = isFavorite ? starFilledIcon : starNotFilledIcon;
    return (
      <div className={styles.header} onClick={toggleIsExpanded}>
        <button
          className={favoriteIconStyles}
          onClick={(event) => {
            event.persist();
            event.stopPropagation();
            onToggleFavorite({
              uniqueId,
              isFavorite,
            });
          }}
        >
          <SVGInline className={styles.warningIcon} svg={starIcon} />
        </button>
        {assetHeaderContent}
        <SVGInline svg={arrow} className={arrowStyles} />
      </div>
    );
  }, [
    asset,
    isExpanded,
    arrowStyles,
    onToggleFavorite,
    isFavorite,
    favoriteIconStyles,
  ]);
  const buttons = useMemo(() => {
    const { recommendedDecimals, decimals } = asset;
    const hasWarning =
      typeof recommendedDecimals === 'number' &&
      decimals !== recommendedDecimals;
    let settingsButtonLabel = intl.formatMessage(messages.settingsButtonLabel);
    let warningPopOverMessage;

    if (hasWarning) {
      warningPopOverMessage =
        typeof decimals === 'number'
          ? messages.settingsWarningPopOverNotUsing
          : messages.settingsWarningPopOverAvailable;
      settingsButtonLabel = (
        <>
          {settingsButtonLabel}
          <SVGInline className={styles.warningIcon} svg={warningIcon} />
        </>
      );
    }

    const settingsButton = (
      <Button
        className={classNames(['flat', styles.button, styles.settingsButton])}
        label={settingsButtonLabel}
        onClick={() =>
          onAssetSettings({
            asset,
          })
        }
      />
    );
    return (
      <div className={styles.footerButtons}>
        {hasWarning ? (
          <PopOver
            content={intl.formatMessage(warningPopOverMessage, {
              recommendedDecimals,
            })}
            className={styles.warningIconWrapper}
          >
            {settingsButton}
          </PopOver>
        ) : (
          settingsButton
        )}
        <Button
          className={classNames([
            'primary',
            styles.button,
            asset.quantity.isZero() ? styles.disabled : null,
          ])}
          onClick={() => onOpenAssetSend(asset)}
          label={intl.formatMessage(messages.tokenSendButton)}
          disabled={asset.quantity.isZero()}
        />
      </div>
    );
  }, [asset, onOpenAssetSend, onAssetSettings, intl]);
  const footer = useMemo(() => {
    return (
      <div className={styles.footer}>
        <dl>
          <dt>{intl.formatMessage(messages.amountLabel)}</dt>
          <dd>
            {' '}
            <AssetAmount
              amount={asset.quantity}
              metadata={asset.metadata}
              decimals={asset.decimals}
              isLoading={isLoading}
              className={styles.assetAmount}
            />
          </dd>
        </dl>
        {buttons}
      </div>
    );
  }, [asset, isLoading, intl, buttons]);
  const { isInsertingAsset, isRemovingAsset } = props;
  const componentStyles = classNames(styles.component, {
    [styles.isExpanded]: isExpanded,
    [styles.inserting]: isInsertingAsset,
    [styles.removing]: isRemovingAsset,
  });
  return (
    <div className={componentStyles}>
      {header}
      <div className={styles.content}>
        <AssetContent
          asset={asset}
          onCopyAssetParam={onCopyAssetParam}
          highlightFingerprint={false}
        />
        {footer}
      </div>
    </div>
  );
});
export default injectIntl(WalletToken);
