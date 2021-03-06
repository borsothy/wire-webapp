/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {RegisteredClient} from '@wireapp/api-client/dist/commonjs/client/index';
import {
  COLOR,
  ContainerXS,
  DeviceIcon,
  ErrorMessage,
  Form,
  ICON_NAME,
  Input,
  InputSubmitCombo,
  Line,
  RoundIconButton,
  Small,
  Text,
} from '@wireapp/react-ui-kit';
import * as React from 'react';
import {InjectedIntlProps, injectIntl} from 'react-intl';
import {clientItemStrings} from '../../strings';
import ValidationError from '../module/action/ValidationError';
import {parseError, parseValidationErrors} from '../util/errorUtil';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  selected: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  client: RegisteredClient;
  clientError: Error;
  onClientRemoval: (password: string) => void;
}

interface State {
  animationStep: number;
  isAnimating: boolean;
  password: string;
  validPassword: boolean;
  validationError: Error;
}

type CombinedProps = Props & InjectedIntlProps;

class ClientItem extends React.Component<CombinedProps, State> {
  private passwordInput: HTMLInputElement;
  state: State;

  static CONFIG = {
    animationSteps: 8,
  };

  static initialState: State = {
    animationStep: 0,
    isAnimating: false,
    password: '',
    validPassword: true,
    validationError: null,
  };

  formatId = (id = '?') => id.toUpperCase().replace(/(..)/g, '$1 ');

  constructor(props: CombinedProps) {
    super(props);
    this.state = {
      ...ClientItem.initialState,
      animationStep: props.selected ? ClientItem.CONFIG.animationSteps : 0,
      isAnimating: false,
    };
  }

  componentWillReceiveProps(newProps: CombinedProps) {
    if (!this.props.selected && newProps.selected) {
      this.setState({isAnimating: true});
      this.executeAnimateIn();
    } else if (this.props.selected && !newProps.selected) {
      this.setState({isAnimating: true});
      this.executeAnimateOut();
    } else {
      this.setState({animationStep: 0});
    }
  }

  executeAnimateIn() {
    if (this.state.animationStep < ClientItem.CONFIG.animationSteps) {
      window.requestAnimationFrame(this.executeAnimateIn.bind(this));
      this.setState(state => ({animationStep: state.animationStep + 1}));
    } else {
      this.setState({isAnimating: false});
    }
  }

  executeAnimateOut() {
    if (this.state.animationStep > 0) {
      window.requestAnimationFrame(this.executeAnimateOut.bind(this));
      this.setState(state => ({animationStep: state.animationStep - 1}));
    } else {
      this.setState({isAnimating: false});
    }
  }

  formatDate = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleString('en-US', {
          day: 'numeric',
          hour: 'numeric',
          hour12: false,
          minute: 'numeric',
          month: 'short',
          weekday: 'short',
          year: 'numeric',
        })
      : '?';

  formatName = (model: string, clazz: string) =>
    model || (
      <Text bold textTransform={'capitalize'}>
        {clazz}
      </Text>
    ) ||
    '?';

  resetState = () => this.setState(ClientItem.initialState);

  wrappedOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    this.resetState();
    this.props.onClick(event);
  };

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let validationError = null;
    if (!this.passwordInput.checkValidity()) {
      validationError = ValidationError.handleValidationState(this.passwordInput.name, this.passwordInput.validity);
    }
    this.setState({validPassword: this.passwordInput.validity.valid, validationError});
    return Promise.resolve(validationError)
      .then(error => {
        if (error) {
          throw error;
        }
      })
      .then(() => this.props.onClientRemoval(this.state.password))
      .catch(error => {
        if (!error.label) {
          throw error;
        }
      });
  };

  render() {
    const {
      client,
      selected,
      clientError,
      intl: {formatMessage: _},
    } = this.props;
    const {validationError, validPassword, password, animationStep, isAnimating} = this.state;
    const animationPosition = animationStep / ClientItem.CONFIG.animationSteps;
    const marginTop = animationPosition * 16;
    const paddingHorizontal = animationPosition * 2;
    const height = animationPosition * 56;
    return (
      <ContainerXS>
        <ContainerXS
          style={{
            backgroundColor: selected ? 'white' : '',
            borderRadius: '4px',
            transition: 'background-color .35s linear',
          }}
          data-uie-value={client.model}
        >
          <ContainerXS
            onClick={this.wrappedOnClick}
            style={{cursor: 'pointer', margin: `${marginTop}px 0 0 0`, padding: '5px 16px 0 16px'}}
            data-uie-name="go-remove-device"
          >
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{flexBasis: '32px', margin: 'auto'}}>
                <DeviceIcon color="#323639" />
              </div>
              <div style={{flexGrow: 1}}>
                <Text bold block color="#323639" data-uie-name="device-header-model">
                  {this.formatName(client.model, client.class)}
                </Text>
                <Small block data-uie-name="device-id">{`ID: ${this.formatId(client.id)}`}</Small>
                <Small block>{this.formatDate(client.time)}</Small>
              </div>
            </div>
            <Line color="rgba(51, 55, 58, .04)" style={{backgroundColor: 'transparent', margin: '4px 0 0 0'}} />
          </ContainerXS>
          {(selected || isAnimating) && (
            <ContainerXS style={{maxHeight: `${height}px`, overflow: 'hidden', padding: `${paddingHorizontal}px 0`}}>
              <Form>
                <InputSubmitCombo style={{background: 'transparent', marginBottom: '0'}}>
                  <Input
                    autoFocus
                    name="password"
                    placeholder={_(clientItemStrings.passwordPlaceholder)}
                    type="password"
                    innerRef={node => (this.passwordInput = node)}
                    value={password}
                    autoComplete="section-login password"
                    maxLength={1024}
                    minLength={8}
                    pattern=".{8,1024}"
                    required
                    style={{background: 'transparent'}}
                    onChange={event =>
                      this.setState({
                        password: event.target.value,
                        validPassword: true,
                      })
                    }
                    data-uie-name="remove-device-password"
                  />
                  <RoundIconButton
                    disabled={!password || !validPassword}
                    color={COLOR.RED}
                    type="submit"
                    icon={ICON_NAME.TRASH}
                    formNoValidate
                    onClick={this.handleSubmit}
                    style={{marginBottom: '-4px'}}
                    data-uie-name="do-remove-device"
                  />
                </InputSubmitCombo>
              </Form>
            </ContainerXS>
          )}
        </ContainerXS>
        {validationError && selected ? (
          <div style={{margin: '16px 0 0 0'}}>{parseValidationErrors(validationError)}</div>
        ) : clientError && selected ? (
          <ErrorMessage style={{margin: '16px 0 0 0'}} data-uie-name="error-message">
            {parseError(clientError)}
          </ErrorMessage>
        ) : null}
      </ContainerXS>
    );
  }
}

export default injectIntl(ClientItem);
