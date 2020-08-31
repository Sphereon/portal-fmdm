import React, { ReactElement, useState, ChangeEvent } from 'react'
import styles from './Add.module.css'
import { useOcean } from '@oceanprotocol/react'
import Header from './Header'
import { toast } from 'react-toastify'
import InputElement from '../../../atoms/Input/InputElement'
import Token from './Token'
import { Balance } from './'
import PriceUnit from '../../../atoms/Price/PriceUnit'
import Actions from './Actions'

// TODO: handle and display all fees somehow

export default function Add({
  setShowAdd,
  poolAddress,
  totalPoolTokens,
  totalBalance
}: {
  setShowAdd: (show: boolean) => void
  poolAddress: string
  totalPoolTokens: string
  totalBalance: Balance
}): ReactElement {
  const { ocean, accountId, balance } = useOcean()
  const [amount, setAmount] = useState('')
  const [txId, setTxId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>()

  const newPoolTokens =
    totalBalance &&
    ((Number(amount) / Number(totalBalance.ocean)) * 100).toFixed(2)

  const newPoolShare =
    totalBalance &&
    ((Number(newPoolTokens) / Number(totalPoolTokens)) * 100).toFixed(2)

  async function handleAddLiquidity() {
    setIsLoading(true)

    try {
      const result = await ocean.pool.addOceanLiquidity(
        accountId,
        poolAddress,
        amount
      )
      setTxId(result.transactionHash)
    } catch (error) {
      console.error(error.message)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value)
  }

  return (
    <div className={styles.add}>
      <Header title="Add Liquidity" backAction={() => setShowAdd(false)} />

      <div className={styles.addInput}>
        <div className={styles.userBalance}>
          <span>Available:</span>
          <PriceUnit price={balance.ocean} symbol="OCEAN" small />
        </div>

        <InputElement
          value={amount}
          name="ocean"
          type="number"
          prefix="OCEAN"
          placeholder="0"
          onChange={handleAmountChange}
        />
      </div>

      <div className={styles.output}>
        <p>You will receive</p>
        <Token symbol="BPT" balance={newPoolTokens} />
        <Token symbol="% of pool" balance={newPoolShare} />
      </div>

      <Actions
        isLoading={isLoading}
        loaderMessage="Adding Liquidity..."
        actionName="Supply"
        action={handleAddLiquidity}
        txId={txId}
      />
    </div>
  )
}